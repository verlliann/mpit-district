# GraphQL Gateway

Node.js/TypeScript GraphQL API Gateway for AI-Newsmaker platform.

## 🎯 Responsibilities

- Single entry point for frontend
- GraphQL API (queries, mutations, subscriptions)
- gRPC client connections to all microservices
- Authentication & authorization
- Real-time updates via WebSocket

## 🏗️ Architecture

```
┌─────────────────┐
│    Frontend     │
└────────┬────────┘
         │ GraphQL
         │ (HTTP/WS)
    ┌────▼────┐
    │GraphQL  │
    │Gateway  │
    └────┬────┘
         │ gRPC
    ┌────┴───────────────┐
    │    Microservices    │
    ├─────────┬──────────┤
    │Storage  │AI Engine │
    │Parser   │Publishing│
    │Media    │          │
    └─────────┴──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Running Storage Service

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run in development mode
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

### Docker

```bash
# Build
docker build -t graphql-gateway .

# Run
docker run -p 4000:4000 \
  -e STORAGE_GRPC_URL=storage-service:50055 \
  graphql-gateway
```

## 📂 Project Structure

```
graphql-gateway/
├── src/
│   ├── schema/
│   │   └── typeDefs.ts        # GraphQL schema
│   ├── resolvers/
│   │   └── index.ts           # Query/Mutation/Subscription resolvers
│   ├── clients/
│   │   ├── storage.ts         # Storage gRPC client
│   │   ├── parser.ts          # Parser gRPC client
│   │   ├── ai-engine.ts       # AI Engine gRPC client
│   │   └── publishing.ts      # Publishing gRPC client
│   ├── auth/
│   │   └── jwt.ts             # JWT authentication
│   ├── utils/
│   │   └── formatters.ts      # Data formatters
│   └── index.ts               # Server entry point
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

Environment variables:

```bash
# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# gRPC Services
STORAGE_GRPC_URL=localhost:50055
PARSER_GRPC_URL=localhost:50051
AI_ENGINE_GRPC_URL=localhost:50052
MEDIA_GRPC_URL=localhost:50053
PUBLISHING_GRPC_URL=localhost:50054

# Redis (for PubSub)
REDIS_URL=redis://localhost:6379/3

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

## 📡 GraphQL API

### Queries

```graphql
# Get articles
query {
  articles(limit: 10, offset: 0) {
    nodes {
      id
      title
      content
      source
    }
    pageInfo {
      hasNextPage
      totalCount
    }
  }
}

# Get single article
query {
  article(id: "123") {
    id
    title
    facts {
      text
      importance
    }
  }
}

# Get posts
query {
  posts(filter: { platform: TELEGRAM, status: PUBLISHED }) {
    nodes {
      id
      content
      metrics {
        views
        likes
      }
    }
  }
}
```

### Mutations

```graphql
# Parse article
mutation {
  parseArticle(url: "https://example.com/article") {
    article {
      id
      title
    }
    error
  }
}

# Generate posts
mutation {
  generatePosts(input: {
    articleId: "123"
    platforms: [TELEGRAM, VK]
    style: ENGAGING
    formalityLevel: 7
  }) {
    id
    platform
    content
  }
}

# Publish post
mutation {
  publishPost(id: "post-123") {
    success
    post {
      id
      status
      externalUrl
    }
    error
  }
}
```

### Subscriptions

```graphql
# Subscribe to post status changes
subscription {
  postStatusChanged(postId: "123") {
    id
    status
    publishedAt
  }
}

# Subscribe to metrics updates
subscription {
  metricsUpdated(postId: "123") {
    views
    likes
    engagement
  }
}

# Subscribe to notifications
subscription {
  notificationReceived {
    id
    title
    message
  }
}
```

## 🧪 Testing

### GraphQL Playground

Access at: `http://localhost:4000/graphql`

### Example Requests

```bash
# Query with curl
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ articles(limit: 5) { nodes { id title } } }"}'

# WebSocket subscription (using wscat)
wscat -c ws://localhost:4000/graphql -s graphql-ws
```

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

## 🔐 Authentication

Currently using JWT tokens (mock implementation).

### Getting Token

```typescript
// TODO: Implement proper login
const token = jwt.sign({ userId: '123', role: 'ADMIN' }, JWT_SECRET);
```

### Using Token

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ me { id email } }"}'
```

## 🔄 Real-time Updates

GraphQL subscriptions use WebSocket (graphql-ws protocol).

**Frontend Example:**

```typescript
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: {
      authorization: `Bearer ${token}`,
    },
  })
);
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:4000/health
```

### Metrics

- Request latency
- Error rates
- gRPC connection status
- Active subscriptions count

## 🐛 Troubleshooting

### gRPC Connection Failed

```bash
# Check if Storage Service is running
grpcurl -plaintext localhost:50055 grpc.health.v1.Health/Check

# Check GraphQL Gateway logs
docker logs graphql-gateway
```

### WebSocket Not Connecting

- Ensure WS endpoint is `ws://` not `http://`
- Check CORS settings
- Verify authentication token

### GraphQL Errors

```graphql
# Enable detailed error messages
query {
  __schema {
    types {
      name
    }
  }
}
```

## 🚀 Deployment

### Environment Variables

Set in production:
- `NODE_ENV=production`
- `JWT_SECRET` (strong secret)
- Proper gRPC URLs
- CORS origins

### Docker Compose

Already configured in `backend/docker-compose.yml`

## 📚 References

- [GraphQL Schema](src/schema/typeDefs.ts)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)
- [Proto Definitions](../../proto/)

## 🎯 Next Steps

- [ ] Implement JWT authentication
- [ ] Add DataLoader for batching
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Implement caching (Redis)
- [ ] Add metrics collection
- [ ] Write comprehensive tests

---

**Status:** ✅ MVP Ready

**Connects:**
- Frontend (Apollo Client)
- Storage Service (gRPC)
- Parser Service (gRPC) - when available
- AI Engine Service (gRPC) - when available
- Publishing Service (gRPC) - when available

