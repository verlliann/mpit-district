#!/bin/bash
# Generate gRPC code from proto files

set -e

echo "Generating gRPC code for Media Service..."

# Create generated directory if it doesn't exist
mkdir -p generated

# Copy proto files from project root
cp ../../*.proto ./proto/ 2>/dev/null || true

# Generate Python code
python -m grpc_tools.protoc \
    -I../../ \
    --python_out=./generated \
    --grpc_python_out=./generated \
    --pyi_out=./generated \
    ../../*.proto

# Create __init__.py
touch generated/__init__.py

# Fix imports in generated files (replace absolute imports with relative)
for file in ./generated/*_pb2*.py; do
    if [ -f "$file" ]; then
        # Replace "import xxx_pb2" with "from generated import xxx_pb2"
        sed -i.bak 's/^import \([a-z_]*\)_pb2/from generated import \1_pb2/g' "$file"
        rm -f "${file}.bak"
    fi
done

echo "✓ gRPC code generation completed"
echo "Generated files:"
ls -lh generated/
