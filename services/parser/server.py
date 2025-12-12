"""gRPC сервер для Parser Service."""

import os
import signal
import sys
from concurrent import futures
import grpc

from proto import parser_pb2_grpc
from handlers import ParserServiceHandler


def serve():
    """Запуск gRPC сервера."""
    grpc_port = os.getenv('GRPC_PORT', '50051')
    
    # Запуск gRPC сервера
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    parser_pb2_grpc.add_ParserServiceServicer_to_server(
        ParserServiceHandler(),
        server
    )
    
    server.add_insecure_port(f'[::]:{grpc_port}')
    server.start()
    
    print(f"✓ gRPC Server started on port {grpc_port}")
    print(f"  - Health Check: gRPC method HealthCheck")
    print(f"  - Parse Article: gRPC method ParseArticle")
    print(f"  - Parse Articles: gRPC method ParseArticles")
    print(f"  - Test URL: gRPC method TestURL")
    print(f"  - Get Supported Sources: gRPC method GetSupportedSources")
    print("\nPress Ctrl+C to stop...")
    
    # Graceful shutdown
    def signal_handler(sig, frame):
        print("\nShutting down server...")
        server.stop(5)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.stop(5)


if __name__ == '__main__':
    serve()
