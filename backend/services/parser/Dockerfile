FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies for playwright and parsing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-unifont \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY services/parser/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install playwright browsers (without --with-deps since we installed deps manually)
RUN playwright install chromium

# Copy proto files from backend root
COPY proto/*.proto ./proto/

# Generate gRPC code from proto files
RUN python -m grpc_tools.protoc \
    -I./proto \
    --python_out=./proto \
    --grpc_python_out=./proto \
    ./proto/*.proto && \
    touch proto/__init__.py && \
    # Fix imports in generated files
    for file in ./proto/*_pb2*.py; do \
        sed -i 's/^import \([a-z_]*\)_pb2/from proto import \1_pb2/g' "$file"; \
    done

# Copy application code
COPY services/parser/ .

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 50051

CMD ["python", "server.py"]

