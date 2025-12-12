package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Post struct {
	ID              string    `json:"id"`
	ArticleID       string    `json:"article_id"`
	UserID          string    `json:"user_id"`
	SocialAccountID string    `json:"social_account_id"`
	Platform        string    `json:"platform"`
	Content         string    `json:"content"`
	Style           string    `json:"style"`
	Status          string    `json:"status"`
	ScheduledAt     time.Time `json:"scheduled_at"`
	PublishedAt     time.Time `json:"published_at"`
	ExternalID      string    `json:"external_id"`
	ExternalURL     string    `json:"external_url"`
	ErrorMessage    string    `json:"error_message"`
	RetryCount      int       `json:"retry_count"`
	LastRetryAt     time.Time `json:"last_retry_at"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type PostRepository struct {
	db    *pgxpool.Pool
	cache *redis.Client
}

func NewPostRepository(db *pgxpool.Pool, cache *redis.Client) *PostRepository {
	return &PostRepository{
		db:    db,
		cache: cache,
	}
}

// SavePost creates a new post
func (r *PostRepository) SavePost(ctx context.Context, post *Post) (*Post, error) {
	post.ID = uuid.New().String()
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()

	query := `
		INSERT INTO posts (
			id, article_id, user_id, social_account_id, platform,
			content, style, status, scheduled_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query,
		post.ID, post.ArticleID, post.UserID, post.SocialAccountID,
		post.Platform, post.Content, post.Style, post.Status,
		post.ScheduledAt, post.CreatedAt, post.UpdatedAt,
	).Scan(&post.ID, &post.CreatedAt, &post.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to insert post: %w", err)
	}

	// Cache the post
	if err := r.cachePost(ctx, post); err != nil {
		fmt.Printf("Failed to cache post: %v\n", err)
	}

	return post, nil
}

// GetPost retrieves a post by ID
func (r *PostRepository) GetPost(ctx context.Context, id string) (*Post, error) {
	// Try cache first
	if post, err := r.getPostFromCache(ctx, id); err == nil && post != nil {
		return post, nil
	}

	query := `
		SELECT id, article_id, user_id, social_account_id, platform,
			content, style, status, scheduled_at, published_at,
			external_id, external_url, error_message, retry_count,
			last_retry_at, created_at, updated_at
		FROM posts
		WHERE id = $1
	`

	post := &Post{}
	var scheduledAt, publishedAt, lastRetryAt *time.Time
	var externalID, externalURL, errorMessage *string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&post.ID, &post.ArticleID, &post.UserID, &post.SocialAccountID,
		&post.Platform, &post.Content, &post.Style, &post.Status,
		&scheduledAt, &publishedAt, &externalID, &externalURL,
		&errorMessage, &post.RetryCount, &lastRetryAt,
		&post.CreatedAt, &post.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}

	if scheduledAt != nil {
		post.ScheduledAt = *scheduledAt
	}
	if publishedAt != nil {
		post.PublishedAt = *publishedAt
	}
	if lastRetryAt != nil {
		post.LastRetryAt = *lastRetryAt
	}
	if externalID != nil {
		post.ExternalID = *externalID
	}
	if externalURL != nil {
		post.ExternalURL = *externalURL
	}
	if errorMessage != nil {
		post.ErrorMessage = *errorMessage
	}

	// Cache for future requests
	if err := r.cachePost(ctx, post); err != nil {
		fmt.Printf("Failed to cache post: %v\n", err)
	}

	return post, nil
}

// ListPosts retrieves posts with pagination
func (r *PostRepository) ListPosts(ctx context.Context, limit, offset int) ([]*Post, int, error) {
	query := `
		SELECT id, article_id, user_id, social_account_id, platform,
			content, style, status, scheduled_at, published_at,
			external_id, external_url, created_at, updated_at
		FROM posts
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	countQuery := `SELECT COUNT(*) FROM posts`

	// Get total count
	var totalCount int
	if err := r.db.QueryRow(ctx, countQuery).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("failed to count posts: %w", err)
	}

	// Get posts
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list posts: %w", err)
	}
	defer rows.Close()

	var posts []*Post
	for rows.Next() {
		post := &Post{}
		var scheduledAt, publishedAt *time.Time
		var externalID, externalURL *string

		err := rows.Scan(
			&post.ID, &post.ArticleID, &post.UserID, &post.SocialAccountID,
			&post.Platform, &post.Content, &post.Style, &post.Status,
			&scheduledAt, &publishedAt, &externalID, &externalURL,
			&post.CreatedAt, &post.UpdatedAt,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan post: %w", err)
		}

		if scheduledAt != nil {
			post.ScheduledAt = *scheduledAt
		}
		if publishedAt != nil {
			post.PublishedAt = *publishedAt
		}
		if externalID != nil {
			post.ExternalID = *externalID
		}
		if externalURL != nil {
			post.ExternalURL = *externalURL
		}

		posts = append(posts, post)
	}

	return posts, totalCount, nil
}

// UpdatePost updates an existing post
func (r *PostRepository) UpdatePost(ctx context.Context, id string, updates map[string]interface{}) (*Post, error) {
	query := `
		UPDATE posts
		SET status = $2, external_id = $3, external_url = $4,
		    published_at = $5, updated_at = $6
		WHERE id = $1
		RETURNING id
	`

	var postID string
	err := r.db.QueryRow(ctx, query,
		id,
		updates["status"],
		updates["external_id"],
		updates["external_url"],
		updates["published_at"],
		time.Now(),
	).Scan(&postID)

	if err != nil {
		return nil, fmt.Errorf("failed to update post: %w", err)
	}

	// Invalidate cache
	cacheKey := fmt.Sprintf("post:%s", id)
	r.cache.Del(ctx, cacheKey)

	return r.GetPost(ctx, id)
}

// DeletePost deletes a post
func (r *PostRepository) DeletePost(ctx context.Context, id string) error {
	query := `DELETE FROM posts WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	// Invalidate cache
	cacheKey := fmt.Sprintf("post:%s", id)
	r.cache.Del(ctx, cacheKey)

	return nil
}

// Cache helpers
func (r *PostRepository) cachePost(ctx context.Context, post *Post) error {
	data, err := json.Marshal(post)
	if err != nil {
		return err
	}

	cacheKey := fmt.Sprintf("post:%s", post.ID)
	return r.cache.Set(ctx, cacheKey, data, 30*time.Minute).Err()
}

func (r *PostRepository) getPostFromCache(ctx context.Context, id string) (*Post, error) {
	cacheKey := fmt.Sprintf("post:%s", id)
	data, err := r.cache.Get(ctx, cacheKey).Bytes()
	if err != nil {
		return nil, err
	}

	var post Post
	if err := json.Unmarshal(data, &post); err != nil {
		return nil, err
	}

	return &post, nil
}

