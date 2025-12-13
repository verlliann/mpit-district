# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY services/graphql-gateway/package*.json ./
RUN npm ci

# Copy proto files
COPY proto/ /proto/

# Copy source code
COPY services/graphql-gateway/ .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/graphql-gateway/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy proto files
COPY proto/ /proto/

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose GraphQL port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/.well-known/apollo/server-health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]

