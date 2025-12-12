.PHONY: help dev up down clean logs db-migrate db-reset proto test build

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

# Development
dev: ## Start development environment (infrastructure only)
	docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Development environment started!"
	@echo ""
	@echo "Services:"
	@echo "  PostgreSQL:      localhost:5432"
	@echo "  PGAdmin:         http://localhost:5050"
	@echo "  Redis:           localhost:6379"
	@echo "  Redis Commander: http://localhost:8081"
	@echo "  MinIO Console:   http://localhost:9001"
	@echo "  RabbitMQ:        http://localhost:15672"
	@echo ""

up: ## Start all services (full stack)
	docker-compose up -d

down: ## Stop all services
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

clean: ## Stop and remove all containers, volumes
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	@echo "✅ All containers and volumes removed"

logs: ## Show logs from all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-service: ## Show logs from specific service (usage: make logs-service SERVICE=postgres)
	docker-compose -f docker-compose.dev.yml logs -f $(SERVICE)

# Database
db-migrate: ## Run database migrations
	@echo "Running migrations..."
	cd services/storage && go run cmd/migrate/main.go up

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "⚠️  This will destroy all database data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.dev.yml down -v postgres; \
		docker-compose -f docker-compose.dev.yml up -d postgres; \
		sleep 5; \
		make db-migrate; \
		echo "✅ Database reset complete"; \
	fi

db-seed: ## Seed database with test data
	@echo "Seeding database..."
	cd services/storage && go run cmd/seed/main.go

db-shell: ## Open PostgreSQL shell
	docker exec -it newsmaker-dev-postgres psql -U newsmaker -d newsmaker

# Proto/gRPC
proto: ## Generate code from proto files
	@echo "Generating code from proto files..."
	@cd proto && ./generate.sh
	@echo "✅ Proto code generated"

proto-lint: ## Lint proto files
	@cd proto && buf lint

# Testing
test: ## Run all tests
	@echo "Running tests..."
	@cd services/storage && go test ./...
	@cd services/parser && pytest
	@cd services/ai-engine && pytest
	@cd services/media && pytest
	@cd services/publishing && npm test
	@cd services/graphql-gateway && npm test
	@echo "✅ All tests passed"

test-integration: ## Run integration tests
	@echo "Running integration tests..."
	@cd tests/integration && go test -v ./...

test-e2e: ## Run end-to-end tests
	@echo "Running E2E tests..."
	@cd tests/e2e && npm test

# Building
build: ## Build all Docker images
	docker-compose build

build-service: ## Build specific service (usage: make build-service SERVICE=storage)
	docker-compose build $(SERVICE)-service

# Code quality
lint: ## Run linters for all services
	@echo "Linting storage service (Go)..."
	@cd services/storage && golangci-lint run
	@echo "Linting Python services..."
	@cd services/parser && flake8 . && mypy .
	@cd services/ai-engine && flake8 . && mypy .
	@cd services/media && flake8 . && mypy .
	@echo "Linting Node.js services..."
	@cd services/publishing && npm run lint
	@cd services/graphql-gateway && npm run lint
	@echo "✅ All linters passed"

format: ## Format code for all services
	@echo "Formatting Go code..."
	@cd services/storage && gofmt -w .
	@echo "Formatting Python code..."
	@cd services/parser && black . && isort .
	@cd services/ai-engine && black . && isort .
	@cd services/media && black . && isort .
	@echo "Formatting TypeScript code..."
	@cd services/publishing && npm run format
	@cd services/graphql-gateway && npm run format
	@echo "✅ All code formatted"

# Utilities
ps: ## Show running containers
	docker-compose -f docker-compose.dev.yml ps

stats: ## Show container resource usage
	docker stats

shell-storage: ## Open shell in storage service
	docker exec -it ai-newsmaker-storage sh

shell-parser: ## Open shell in parser service
	docker exec -it ai-newsmaker-parser sh

shell-gateway: ## Open shell in GraphQL gateway
	docker exec -it ai-newsmaker-graphql sh

# Setup
setup: ## Initial setup (install dependencies, generate proto)
	@echo "Setting up project..."
	@echo "Installing Go dependencies..."
	@cd services/storage && go mod download
	@echo "Installing Python dependencies..."
	@cd services/parser && pip install -r requirements.txt
	@cd services/ai-engine && pip install -r requirements.txt
	@cd services/media && pip install -r requirements.txt
	@echo "Installing Node.js dependencies..."
	@cd services/publishing && npm install
	@cd services/graphql-gateway && npm install
	@echo "Generating proto files..."
	@make proto
	@echo "✅ Setup complete!"

install-tools: ## Install development tools
	@echo "Installing development tools..."
	@echo "Installing buf (proto linter)..."
	go install github.com/bufbuild/buf/cmd/buf@latest
	@echo "Installing golangci-lint..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "Installing grpcurl..."
	go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
	@echo "✅ Tools installed"

# Monitoring
prometheus: ## Start Prometheus
	docker run -d -p 9090:9090 -v $(PWD)/config/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus

grafana: ## Start Grafana
	docker run -d -p 3001:3000 grafana/grafana

jaeger: ## Start Jaeger
	docker run -d -p 16686:16686 -p 6831:6831/udp jaegertracing/all-in-one

# Documentation
docs: ## Generate API documentation
	@echo "Generating API documentation..."
	@cd proto && buf generate --template buf.gen.doc.yaml
	@echo "✅ Documentation generated in docs/api/"

docs-serve: ## Serve documentation locally
	@cd docs && python -m http.server 8080

# Convenience aliases
start: dev ## Alias for 'make dev'
stop: down ## Alias for 'make down'
restart: down dev ## Restart development environment

