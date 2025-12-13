FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    tesseract-ocr-rus \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY services/media/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create generated directory
RUN mkdir -p generated

# Copy proto files from root
COPY proto/*.proto ./proto/

# Generate gRPC code from proto files
RUN python -m grpc_tools.protoc \
    -I./proto \
    --python_out=./generated \
    --grpc_python_out=./generated \
    ./proto/*.proto && \
    touch generated/__init__.py && \
    # Fix imports in generated files
    for file in ./generated/*_pb2*.py; do \
        sed -i 's/^import \([a-z_]*\)_pb2/from generated import \1_pb2/g' "$file"; \
    done

# Copy application code
COPY services/media/ .

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/generated

EXPOSE 50053

CMD ["python", "main.py"]
