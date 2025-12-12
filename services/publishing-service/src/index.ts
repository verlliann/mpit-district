import { Server, ServerCredentials } from '@grpc/grpc-js';
import { config } from './config';
import { logger } from './utils/logger';
import { PublishingServiceImpl } from './services/publishing.service';
import { loadProtoDefinition } from './utils/proto-loader';
import { initializeQueue } from './queue';

async function main() {
  try {
    logger.info('Starting Publishing Service...');

    // Initialize Redis queue
    await initializeQueue();
    logger.info('Queue initialized');

    // Load proto definitions
    const packageDefinition = loadProtoDefinition('publishing.proto');
    const publishingProto = packageDefinition.publishing as any;

    // Create gRPC server
    const server = new Server();

    // Add service implementation
    server.addService(
      publishingProto.PublishingService.service,
      new PublishingServiceImpl() as any
    );

    // Bind and start server
    const address = `${config.grpcHost}:${config.port}`;
    server.bindAsync(
      address,
      ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          logger.error({ error }, 'Failed to bind server');
          process.exit(1);
        }

        logger.info({ address, port }, 'Publishing Service gRPC server started');
      }
    );

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.tryShutdown(() => {
        logger.info('Server shut down');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      server.tryShutdown(() => {
        logger.info('Server shut down');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error({ error }, 'Failed to start service');
    process.exit(1);
  }
}

main();


