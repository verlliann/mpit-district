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

type Article struct {
	ID               string    `json:"id"`
	URL              string    `json:"url"`
	Title            string    `json:"title"`
	Content          string    `json:"content"`
	Excerpt          string    `json:"excerpt"`
	Source           string    `json:"source"`
	Author           string    `json:"author"`
	PublishedAt      time.Time `json:"published_at"`
	ParsedAt         time.Time `json:"parsed_at"`
	Sentiment        string    `json:"sentiment"`
	SentimentScore   float64   `json:"sentiment_score"`
	Language         string    `json:"language"`
	WordCount        int       `json:"word_count"`
	ReadingTime      int       `json:"reading_time_minutes"`
	IsArchived       bool      `json:"is_archived"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type ArticleRepository struct {
	db    *pgxpool.Pool
	cache *redis.Client
}

func NewArticleRepository(db *pgxpool.Pool, cache *redis.Client) *ArticleRepository {
	return &ArticleRepository{
		db:    db,
		cache: cache,
	}
}

// SaveArticle creates a new article
func (r *ArticleRepository) SaveArticle(ctx context.Context, article *Article) (*Article, error) {
	article.ID = uuid.New().String()
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()
	article.ParsedAt = time.Now()

	query := `
		INSERT INTO articles (
			id, url, title, content, excerpt, source, author,
			published_at, parsed_at, language, word_count, reading_time_minutes,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query,
		article.ID, article.URL, article.Title, article.Content, article.Excerpt,
		article.Source, article.Author, article.PublishedAt, article.ParsedAt,
		article.Language, article.WordCount, article.ReadingTime,
		article.CreatedAt, article.UpdatedAt,
	).Scan(&article.ID, &article.CreatedAt, &article.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to insert article: %w", err)
	}

	// Cache the article
	if err := r.cacheArticle(ctx, article); err != nil {
		// Log error but don't fail the operation
		fmt.Printf("Failed to cache article: %v\n", err)
	}

	return article, nil
}

// GetArticle retrieves an article by ID
func (r *ArticleRepository) GetArticle(ctx context.Context, id string) (*Article, error) {
	// Try cache first
	if article, err := r.getArticleFromCache(ctx, id); err == nil && article != nil {
		return article, nil
	}

	query := `
		SELECT id, url, title, content, excerpt, source, author,
			published_at, parsed_at, sentiment, sentiment_score,
			language, word_count, reading_time_minutes, is_archived,
			created_at, updated_at
		FROM articles
		WHERE id = $1
	`

	article := &Article{}
	var publishedAt, parsedAt *time.Time
	var sentiment *string
	var sentimentScore *float64

	err := r.db.QueryRow(ctx, query, id).Scan(
		&article.ID, &article.URL, &article.Title, &article.Content,
		&article.Excerpt, &article.Source, &article.Author,
		&publishedAt, &parsedAt, &sentiment, &sentimentScore,
		&article.Language, &article.WordCount, &article.ReadingTime,
		&article.IsArchived, &article.CreatedAt, &article.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	if publishedAt != nil {
		article.PublishedAt = *publishedAt
	}
	if parsedAt != nil {
		article.ParsedAt = *parsedAt
	}
	if sentiment != nil {
		article.Sentiment = *sentiment
	}
	if sentimentScore != nil {
		article.SentimentScore = *sentimentScore
	}

	// Cache for future requests
	if err := r.cacheArticle(ctx, article); err != nil {
		fmt.Printf("Failed to cache article: %v\n", err)
	}

	return article, nil
}

// GetArticleByURL retrieves an article by URL
func (r *ArticleRepository) GetArticleByURL(ctx context.Context, url string) (*Article, error) {
	query := `
		SELECT id FROM articles WHERE url = $1
	`

	var id string
	err := r.db.QueryRow(ctx, query, url).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("article not found: %w", err)
	}

	return r.GetArticle(ctx, id)
}

// ListArticles retrieves articles with pagination and filters
func (r *ArticleRepository) ListArticles(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*Article, int, error) {
	query := `
		SELECT id, url, title, content, excerpt, source, author,
			published_at, parsed_at, sentiment, sentiment_score,
			language, word_count, reading_time_minutes, is_archived,
			created_at, updated_at
		FROM articles
		WHERE is_archived = false
		ORDER BY parsed_at DESC
		LIMIT $1 OFFSET $2
	`

	countQuery := `SELECT COUNT(*) FROM articles WHERE is_archived = false`

	// Get total count
	var totalCount int
	if err := r.db.QueryRow(ctx, countQuery).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("failed to count articles: %w", err)
	}

	// Get articles
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list articles: %w", err)
	}
	defer rows.Close()

	var articles []*Article
	for rows.Next() {
		article := &Article{}
		var publishedAt, parsedAt *time.Time
		var sentiment *string
		var sentimentScore *float64

		err := rows.Scan(
			&article.ID, &article.URL, &article.Title, &article.Content,
			&article.Excerpt, &article.Source, &article.Author,
			&publishedAt, &parsedAt, &sentiment, &sentimentScore,
			&article.Language, &article.WordCount, &article.ReadingTime,
			&article.IsArchived, &article.CreatedAt, &article.UpdatedAt,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan article: %w", err)
		}

		if publishedAt != nil {
			article.PublishedAt = *publishedAt
		}
		if parsedAt != nil {
			article.ParsedAt = *parsedAt
		}
		if sentiment != nil {
			article.Sentiment = *sentiment
		}
		if sentimentScore != nil {
			article.SentimentScore = *sentimentScore
		}

		articles = append(articles, article)
	}

	return articles, totalCount, nil
}

// UpdateArticle updates an existing article
func (r *ArticleRepository) UpdateArticle(ctx context.Context, id string, updates map[string]interface{}) (*Article, error) {
	// Build dynamic update query
	// For simplicity, only updating sentiment here
	query := `
		UPDATE articles
		SET sentiment = $2, sentiment_score = $3, updated_at = $4
		WHERE id = $1
		RETURNING id
	`

	sentiment := updates["sentiment"]
	sentimentScore := updates["sentiment_score"]

	var articleID string
	err := r.db.QueryRow(ctx, query, id, sentiment, sentimentScore, time.Now()).Scan(&articleID)
	if err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}

	// Invalidate cache
	cacheKey := fmt.Sprintf("article:%s", id)
	r.cache.Del(ctx, cacheKey)

	return r.GetArticle(ctx, id)
}

// DeleteArticle soft deletes an article
func (r *ArticleRepository) DeleteArticle(ctx context.Context, id string) error {
	query := `UPDATE articles SET is_archived = true, updated_at = $2 WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id, time.Now())
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	// Invalidate cache
	cacheKey := fmt.Sprintf("article:%s", id)
	r.cache.Del(ctx, cacheKey)

	return nil
}

// Cache helpers
func (r *ArticleRepository) cacheArticle(ctx context.Context, article *Article) error {
	data, err := json.Marshal(article)
	if err != nil {
		return err
	}

	cacheKey := fmt.Sprintf("article:%s", article.ID)
	return r.cache.Set(ctx, cacheKey, data, 1*time.Hour).Err()
}

func (r *ArticleRepository) getArticleFromCache(ctx context.Context, id string) (*Article, error) {
	cacheKey := fmt.Sprintf("article:%s", id)
	data, err := r.cache.Get(ctx, cacheKey).Bytes()
	if err != nil {
		return nil, err
	}

	var article Article
	if err := json.Unmarshal(data, &article); err != nil {
		return nil, err
	}

	return &article, nil
}

