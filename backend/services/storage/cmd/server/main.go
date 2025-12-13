package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ai-newsmaker/storage-service/internal/config"
	"github.com/ai-newsmaker/storage-service/internal/db"
	"github.com/ai-newsmaker/storage-service/internal/repository"
	"github.com/ai-newsmaker/storage-service/internal/server"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	log.Printf("🚀 Starting Storage Service on port %s", cfg.GRPCPort)

	// Initialize database
	log.Println("📦 Connecting to PostgreSQL...")
	dbPool, err := db.NewPostgresPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()
	log.Println("✅ PostgreSQL connected")

	// Initialize Redis
	log.Println("📦 Connecting to Redis...")
	redisClient, err := db.NewRedisClient(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()
	log.Println("✅ Redis connected")

	// Test connections
	ctx := context.Background()
	if err := dbPool.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("Redis ping failed: %v", err)
	}

	// Initialize repositories
	articleRepo := repository.NewArticleRepository(dbPool, redisClient)
	postRepo := repository.NewPostRepository(dbPool, redisClient)
	
	// Create gRPC server
	grpcServer := grpc.NewServer(
		grpc.MaxRecvMsgSize(10 * 1024 * 1024), // 10MB
		grpc.MaxSendMsgSize(10 * 1024 * 1024), // 10MB
	)

	// Register service
	_ = server.NewStorageServer(articleRepo, postRepo)
	// TODO: Uncomment after proto generation
	// pb.RegisterStorageServiceServer(grpcServer, storageServer)

	// Register health check
	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(grpcServer, healthServer)
	healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_SERVING)

	// Register reflection (for grpcurl)
	reflection.Register(grpcServer)

	// Create listener
	listener, err := net.Listen("tcp", fmt.Sprintf(":%s", cfg.GRPCPort))
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	// Start server in goroutine
	go func() {
		log.Printf("✅ gRPC server listening on :%s", cfg.GRPCPort)
		if err := grpcServer.Serve(listener); err != nil {
			log.Fatalf("Failed to serve: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down gracefully...")

	// Graceful shutdown
	healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_NOT_SERVING)
	
	// Give ongoing requests 5 seconds to finish
	done := make(chan struct{})
	go func() {
		grpcServer.GracefulStop()
		close(done)
	}()

	select {
	case <-done:
		log.Println("✅ Server stopped gracefully")
	case <-time.After(5 * time.Second):
		grpcServer.Stop()
		log.Println("⚠️  Server stopped forcefully")
	}
}

