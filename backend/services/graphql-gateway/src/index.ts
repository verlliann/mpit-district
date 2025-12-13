import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { StorageClient } from './clients/storage';
import { ParserClient } from './clients/parser';
import { AIEngineClient } from './clients/ai-engine';
import { PublishingClient } from './clients/publishing';

dotenv.config();

const PORT = process.env.PORT || 4000;
const STORAGE_GRPC_URL = process.env.STORAGE_GRPC_URL || 'localhost:50055';
const PARSER_GRPC_URL = process.env.PARSER_GRPC_URL || 'localhost:50051';
const AI_ENGINE_GRPC_URL = process.env.AI_ENGINE_GRPC_URL || 'localhost:50052';
const PUBLISHING_GRPC_URL = process.env.PUBLISHING_GRPC_URL || 'localhost:50054';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Create schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Initialize gRPC clients
  const storageClient = new StorageClient(STORAGE_GRPC_URL);
  const parserClient = new ParserClient(PARSER_GRPC_URL);
  const aiEngineClient = new AIEngineClient(AI_ENGINE_GRPC_URL);
  const publishingClient = new PublishingClient(PUBLISHING_GRPC_URL);

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        // Extract token from connection params
        const token = ctx.connectionParams?.authorization || '';
        // TODO: Verify JWT token
        return {
          storageClient,
          parserClient,
          aiEngineClient,
          publishingClient,
          userId: 'user-1', // Mock user ID
        };
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for WebSocket server
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: true,  // Разрешить все origins для разработки
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract auth token
        const token = req.headers.authorization || '';
        
        // TODO: Verify JWT token
        // For now, mock authentication
        const userId = 'user-1';

        return {
          storageClient,
          parserClient,
          aiEngineClient,
          publishingClient,
          userId,
          user: {
            id: userId,
            email: 'admin@newsmaker.dev',
            role: 'ADMIN',
          },
        };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'graphql-gateway',
      timestamp: new Date().toISOString(),
    });
  });

  // Apollo health check
  app.get('/.well-known/apollo/server-health', (req, res) => {
    res.status(200).send('OK');
  });

  // Start server
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log('🚀 GraphQL Gateway started!');
  console.log(`📊 Query endpoint:        http://localhost:${PORT}/graphql`);
  console.log(`🔄 Subscription endpoint: ws://localhost:${PORT}/graphql`);
  console.log(`❤️  Health check:         http://localhost:${PORT}/health`);
  console.log('');
  console.log('🔗 Connected to:');
  console.log(`   Storage Service:     ${STORAGE_GRPC_URL}`);
  console.log(`   Parser Service:      ${PARSER_GRPC_URL}`);
  console.log(`   AI Engine Service:   ${AI_ENGINE_GRPC_URL}`);
  console.log(`   Publishing Service:  ${PUBLISHING_GRPC_URL}`);
  console.log('');
  console.log('✅ Ready to accept requests!');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

