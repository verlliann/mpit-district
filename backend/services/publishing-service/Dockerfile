# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install python3 and build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY services/publishing-service/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY services/publishing-service/ .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install python3 and build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY services/publishing-service/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy proto files from root backend
COPY proto/*.proto ./proto/

# Copy built files from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 50054

CMD ["node", "dist/index.js"]

