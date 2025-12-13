FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY services/ai-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create generated directory
RUN mkdir -p generated

# Copy proto files from root
COPY proto/*.proto ./proto/

# Generate gRPC code from proto files (without runtime_version check)
RUN python -m grpc_tools.protoc \
    -I./proto \
    --python_out=./generated \
    --pyi_out=./generated \
    --grpc_python_out=./generated \
    ./proto/ai_engine.proto && \
    touch generated/__init__.py && \
    # Fix imports in generated files
    for file in ./generated/*_pb2*.py; do \
        sed -i 's/^import \([a-z_]*\)_pb2/from generated import \1_pb2/g' "$file"; \
    done && \
    # Remove runtime_version check from generated files
    for file in ./generated/*_pb2.py; do \
        sed -i '/from google.protobuf import runtime_version/d' "$file"; \
        sed -i '/runtime_version/d' "$file"; \
    done

# Copy application code
COPY services/ai-engine/ .

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/generated

EXPOSE 50052

CMD ["python", "main.py"]
