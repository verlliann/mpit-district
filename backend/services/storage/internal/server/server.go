package server

import (
	"context"
	"log"

	"github.com/ai-newsmaker/storage-service/internal/repository"
	// "github.com/ai-newsmaker/storage-service/internal/pb" // Uncomment after proto generation
)

// StorageServer implements the gRPC StorageService
type StorageServer struct {
	// pb.UnimplementedStorageServiceServer // Uncomment after proto generation
	articleRepo *repository.ArticleRepository
	postRepo    *repository.PostRepository
}

// NewStorageServer creates a new StorageServer
func NewStorageServer(
	articleRepo *repository.ArticleRepository,
	postRepo *repository.PostRepository,
) *StorageServer {
	return &StorageServer{
		articleRepo: articleRepo,
		postRepo:    postRepo,
	}
}

// HealthCheck returns the service health status
func (s *StorageServer) HealthCheck(ctx context.Context) error {
	log.Println("Health check called")
	return nil
}

// Example method (uncomment and implement after proto generation):
/*
func (s *StorageServer) SaveArticle(ctx context.Context, req *pb.SaveArticleRequest) (*pb.Article, error) {
	article := &repository.Article{
		URL:     req.Url,
		Title:   req.Title,
		Content: req.Content,
		Excerpt: req.Excerpt,
		Source:  req.Source,
		Author:  req.Author,
		Language: req.Language,
	}

	savedArticle, err := s.articleRepo.SaveArticle(ctx, article)
	if err != nil {
		return nil, err
	}

	// Convert to proto response
	return &pb.Article{
		Id:      savedArticle.ID,
		Url:     savedArticle.URL,
		Title:   savedArticle.Title,
		Content: savedArticle.Content,
		Source:  savedArticle.Source,
		// ... map other fields
	}, nil
}

func (s *StorageServer) GetArticle(ctx context.Context, req *pb.GetArticleRequest) (*pb.Article, error) {
	var article *repository.Article
	var err error

	if req.Id != "" {
		article, err = s.articleRepo.GetArticle(ctx, req.Id)
	} else if req.Url != "" {
		article, err = s.articleRepo.GetArticleByURL(ctx, req.Url)
	} else {
		return nil, fmt.Errorf("either id or url must be provided")
	}

	if err != nil {
		return nil, err
	}

	// Convert to proto response
	return &pb.Article{
		Id:      article.ID,
		Url:     article.URL,
		Title:   article.Title,
		Content: article.Content,
		Source:  article.Source,
		// ... map other fields
	}, nil
}
*/

// TODO: Implement all gRPC methods from storage.proto after code generation:
// - SaveArticle
// - GetArticle
// - ListArticles
// - UpdateArticle
// - DeleteArticle
// - SavePost
// - GetPost
// - ListPosts
// - UpdatePost
// - DeletePost
// - SaveMetrics
// - GetLatestMetrics
// - etc.

