#!/bin/bash

# Proto code generation script
# Generates Go, Python, and TypeScript code from .proto files

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🔧 Generating code from Proto files..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if buf is installed
if ! command -v buf &> /dev/null; then
    echo -e "${RED}❌ buf is not installed${NC}"
    echo "Install it with: brew install bufbuild/buf/buf"
    echo "Or: go install github.com/bufbuild/buf/cmd/buf@latest"
    exit 1
fi

# Check if protoc is installed (alternative method)
if ! command -v protoc &> /dev/null; then
    echo -e "${RED}⚠️  protoc is not installed (optional but recommended)${NC}"
fi

echo -e "${BLUE}📋 Linting proto files...${NC}"
buf lint

echo ""
echo -e "${BLUE}🔨 Generating Go code...${NC}"

# Create output directories
mkdir -p ../services/storage/internal/pb
mkdir -p ../services/parser/src/pb
mkdir -p ../services/ai-engine/src/pb
mkdir -p ../services/media/src/pb
mkdir -p ../services/publishing/src/pb
mkdir -p ../services/graphql-gateway/src/pb

# Generate Go code for Storage Service
echo "  → Storage Service (Go)"
protoc --go_out=../services/storage/internal/pb --go_opt=paths=source_relative \
       --go-grpc_out=../services/storage/internal/pb --go-grpc_opt=paths=source_relative \
       --proto_path=. \
       common.proto storage.proto

echo ""
echo -e "${BLUE}🔨 Generating Python code...${NC}"

# Generate Python code for Parser Service
echo "  → Parser Service (Python)"
python -m grpc_tools.protoc \
    --proto_path=. \
    --python_out=../services/parser/src/pb \
    --pyi_out=../services/parser/src/pb \
    --grpc_python_out=../services/parser/src/pb \
    common.proto parser.proto storage.proto

# Generate Python code for AI Engine Service
echo "  → AI Engine Service (Python)"
python -m grpc_tools.protoc \
    --proto_path=. \
    --python_out=../services/ai-engine/src/pb \
    --pyi_out=../services/ai-engine/src/pb \
    --grpc_python_out=../services/ai-engine/src/pb \
    common.proto ai_engine.proto storage.proto

# Generate Python code for Media Service
echo "  → Media Service (Python)"
python -m grpc_tools.protoc \
    --proto_path=. \
    --python_out=../services/media/src/pb \
    --pyi_out=../services/media/src/pb \
    --grpc_python_out=../services/media/src/pb \
    common.proto media.proto storage.proto

echo ""
echo -e "${BLUE}🔨 Generating TypeScript/JavaScript code...${NC}"

# Generate TypeScript code for Publishing Service
echo "  → Publishing Service (Node.js/TypeScript)"
protoc --plugin=protoc-gen-ts=../node_modules/.bin/protoc-gen-ts \
       --plugin=protoc-gen-grpc=../node_modules/.bin/grpc_tools_node_protoc_plugin \
       --js_out=import_style=commonjs:../services/publishing/src/pb \
       --ts_out=grpc_js:../services/publishing/src/pb \
       --grpc_out=grpc_js:../services/publishing/src/pb \
       --proto_path=. \
       common.proto publishing.proto storage.proto 2>/dev/null || \
       echo "  ⚠️  Node.js proto generation skipped (install packages first)"

# Generate TypeScript code for GraphQL Gateway
echo "  → GraphQL Gateway (Node.js/TypeScript)"
protoc --plugin=protoc-gen-ts=../node_modules/.bin/protoc-gen-ts \
       --plugin=protoc-gen-grpc=../node_modules/.bin/grpc_tools_node_protoc_plugin \
       --js_out=import_style=commonjs:../services/graphql-gateway/src/pb \
       --ts_out=grpc_js:../services/graphql-gateway/src/pb \
       --grpc_out=grpc_js:../services/graphql-gateway/src/pb \
       --proto_path=. \
       common.proto storage.proto parser.proto ai_engine.proto media.proto publishing.proto 2>/dev/null || \
       echo "  ⚠️  Node.js proto generation skipped (install packages first)"

echo ""
echo -e "${BLUE}📝 Creating __init__.py files for Python packages...${NC}"

# Create __init__.py files
touch ../services/parser/src/pb/__init__.py
touch ../services/ai-engine/src/pb/__init__.py
touch ../services/media/src/pb/__init__.py

echo ""
echo -e "${GREEN}✅ Proto code generation complete!${NC}"
echo ""
echo "Generated files:"
echo "  - Go:         services/storage/internal/pb/"
echo "  - Python:     services/{parser,ai-engine,media}/src/pb/"
echo "  - TypeScript: services/{publishing,graphql-gateway}/src/pb/"
echo ""
echo "Next steps:"
echo "  1. Review generated code"
echo "  2. Import proto types in your services"
echo "  3. Implement gRPC service handlers"
echo ""

