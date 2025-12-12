package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	// Server
	GRPCPort string
	
	// Database
	DatabaseURL string
	
	// Redis
	RedisURL string
	
	// Cache
	CacheTTL int // seconds
	
	// Environment
	Environment string
	LogLevel    string
}

func Load() (*Config, error) {
	cfg := &Config{
		GRPCPort:    getEnv("GRPC_PORT", "50055"),
		DatabaseURL: getEnv("DATABASE_URL", ""),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379/0"),
		CacheTTL:    getEnvAsInt("CACHE_TTL", 3600),
		Environment: getEnv("ENVIRONMENT", "development"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
	}

	// Validate required fields
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}

