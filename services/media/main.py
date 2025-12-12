import asyncio
import signal
import sys
from concurrent import futures

import grpc
import structlog

from config import settings
from service import MediaServicer
from generated import media_pb2_grpc

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


class GracefulExit(SystemExit):
    code = 0


def handle_signal(signum, frame):
    raise GracefulExit()


async def serve():
    """Start the gRPC server."""
    server = grpc.aio.server(
        futures.ThreadPoolExecutor(max_workers=settings.GRPC_MAX_WORKERS),
        options=[
            ('grpc.max_send_message_length', 100 * 1024 * 1024),  # 100MB
            ('grpc.max_receive_message_length', 100 * 1024 * 1024),  # 100MB
        ]
    )
    
    # Add servicer
    servicer = MediaServicer()
    media_pb2_grpc.add_MediaServiceServicer_to_server(servicer, server)
    
    # Bind port
    listen_addr = f"[::]:{settings.GRPC_PORT}"
    server.add_insecure_port(listen_addr)
    
    logger.info("Starting Media Service", port=settings.GRPC_PORT)
    
    await server.start()
    
    logger.info(
        "Media Service started",
        port=settings.GRPC_PORT,
        minio_endpoint=settings.MINIO_ENDPOINT
    )
    
    # Handle graceful shutdown
    try:
        await server.wait_for_termination()
    except GracefulExit:
        logger.info("Shutting down gracefully...")
        await server.stop(5)


def main():
    # Setup signal handlers
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)
    
    try:
        asyncio.run(serve())
    except GracefulExit:
        logger.info("Server stopped")
        sys.exit(0)


if __name__ == "__main__":
    main()

