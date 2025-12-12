"""gRPC клиент для тестирования Parser Service."""

import grpc
import sys
import os

# Добавляем текущую директорию в путь
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from proto import parser_pb2, parser_pb2_grpc, common_pb2


def test_health_check(channel):
    """Тест HealthCheck метода."""
    print("\n" + "="*60)
    print("1. Testing HealthCheck")
    print("="*60)
    
    stub = parser_pb2_grpc.ParserServiceStub(channel)
    request = common_pb2.HealthCheckRequest(service="parser")
    
    try:
        response = stub.HealthCheck(request)
        print(f"Status: {common_pb2.HealthCheckResponse.ServingStatus.Name(response.status)}")
        print(f"Message: {response.message}")
        return response.status == common_pb2.HealthCheckResponse.SERVING
    except Exception as e:
        print(f"ERROR: {e}")
        return False


def test_parse_article(channel, url: str):
    """Тест ParseArticle метода."""
    print("\n" + "="*60)
    print(f"2. Testing ParseArticle: {url}")
    print("="*60)
    
    stub = parser_pb2_grpc.ParserServiceStub(channel)
    request = parser_pb2.ParseArticleRequest(
        url=url,
        force_refresh=False,
        use_browser=True  # Для Telegram и других JS-сайтов нужен браузер
    )
    
    try:
        response = stub.ParseArticle(request)
        
        if response.success:
            article = response.article
            print(f"✓ Success!")
            print(f"Title: {article.title[:100] if article.title else 'N/A'}")
            print(f"Source: {article.source}")
            print(f"Content length: {len(article.content)} chars")
            print(f"Images: {len(article.images)}")
            
            # Вывод текста содержимого
            if article.content:
                print(f"\nContent (first 500 chars):")
                print("-" * 60)
                print(article.content[:500])
                if len(article.content) > 500:
                    print(f"... ({len(article.content) - 500} more chars)")
                print("-" * 60)
            else:
                print("⚠ Content is empty!")
            
            # Вывод изображений
            if article.images:
                print(f"\nImages ({len(article.images)}):")
                for i, img in enumerate(article.images[:5], 1):  # Показываем первые 5
                    print(f"  {i}. {img.url[:80]}...")
                    if img.alt_text:
                        print(f"     Alt: {img.alt_text[:50]}")
                    if img.width and img.height:
                        print(f"     Size: {img.width}x{img.height}")
                if len(article.images) > 5:
                    print(f"  ... and {len(article.images) - 5} more images")
            else:
                print("\n⚠ No images found")
            
            # Вывод excerpt если есть
            if article.excerpt:
                print(f"\nExcerpt: {article.excerpt[:200]}")
            
            # Вывод автора если есть
            if article.author:
                print(f"Author: {article.author}")
            
            if response.metadata:
                meta = response.metadata
                print(f"\nParsing time: {meta.parsing_time_ms}ms")
                print(f"From cache: {meta.from_cache}")
                print(f"Strategy: {parser_pb2.ParsingStrategy.Name(meta.strategy)}")
            
            return True
        else:
            print(f"✗ Failed: {response.error}")
            return False
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_test_url(channel, url: str):
    """Тест TestURL метода."""
    print("\n" + "="*60)
    print(f"3. Testing TestURL: {url}")
    print("="*60)
    
    stub = parser_pb2_grpc.ParserServiceStub(channel)
    request = parser_pb2.TestURLRequest(url=url)
    
    try:
        response = stub.TestURL(request)
        print(f"Supported: {response.is_supported}")
        print(f"Source: {response.source}")
        print(f"Requires browser: {response.requires_browser}")
        if response.error:
            print(f"Error: {response.error}")
        return response.is_supported
    except Exception as e:
        print(f"ERROR: {e}")
        return False


def test_get_supported_sources(channel):
    """Тест GetSupportedSources метода."""
    print("\n" + "="*60)
    print("4. Testing GetSupportedSources")
    print("="*60)
    
    stub = parser_pb2_grpc.ParserServiceStub(channel)
    request = parser_pb2.GetSupportedSourcesRequest()
    
    try:
        response = stub.GetSupportedSources(request)
        print(f"Found {len(response.sources)} sources:")
        for i, source in enumerate(response.sources[:10], 1):  # Показываем первые 10
            print(f"  {i}. {source.domain} ({source.name})")
            print(f"     Strategy: {parser_pb2.ParsingStrategy.Name(source.strategy)}")
            print(f"     Browser required: {source.requires_browser}")
        if len(response.sources) > 10:
            print(f"  ... and {len(response.sources) - 10} more")
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_parse_articles_batch(channel, urls: list):
    """Тест ParseArticles (batch) метода."""
    print("\n" + "="*60)
    print(f"5. Testing ParseArticles (batch): {len(urls)} URLs")
    print("="*60)
    
    stub = parser_pb2_grpc.ParserServiceStub(channel)
    request = parser_pb2.ParseArticlesRequest(
        urls=urls,
        use_browser=False
    )
    
    try:
        success_count = 0
        for i, response in enumerate(stub.ParseArticles(request), 1):
            if response.success:
                print(f"  [{i}] ✓ {response.article.url[:60]}...")
                success_count += 1
            else:
                print(f"  [{i}] ✗ {response.error}")
        
        print(f"\nSuccess: {success_count}/{len(urls)}")
        return success_count > 0
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Главная функция."""
    import argparse
    
    parser = argparse.ArgumentParser(description='gRPC клиент для Parser Service')
    parser.add_argument('--host', default='localhost', help='gRPC server host')
    parser.add_argument('--port', type=int, default=50051, help='gRPC server port')
    parser.add_argument('--url', help='URL для тестирования ParseArticle')
    parser.add_argument('--test-all', action='store_true', help='Запустить все тесты')
    
    args = parser.parse_args()
    
    server_address = f"{args.host}:{args.port}"
    
    print("="*60)
    print("Parser Service - gRPC Test Client")
    print("="*60)
    print(f"Connecting to: {server_address}")
    
    try:
        with grpc.insecure_channel(server_address) as channel:
            # Проверка подключения
            try:
                grpc.channel_ready_future(channel).result(timeout=5)
                print("✓ Connected to server")
            except grpc.FutureTimeoutError:
                print("✗ Connection timeout. Is server running?")
                print(f"  Start server with: python server.py")
                return
            
            # Если передан URL, тестируем только парсинг
            if args.url:
                test_parse_article(channel, args.url)
                return
            
            # Если --test-all, запускаем все тесты
            if args.test_all:
                test_health_check(channel)
                test_get_supported_sources(channel)
                
                # Тестируем с примером URL
                test_url = "https://tass.ru/ekonomika/12345678"
                test_test_url(channel, test_url)
                test_parse_article(channel, test_url)
                return
            
            # Интерактивный режим
            print("\nВыберите тест:")
            print("1. HealthCheck")
            print("2. ParseArticle")
            print("3. TestURL")
            print("4. GetSupportedSources")
            print("5. ParseArticles (batch)")
            print("6. All tests")
            print("0. Exit")
            
            while True:
                try:
                    choice = input("\nChoice (0-6): ").strip()
                    
                    if choice == '0':
                        break
                    elif choice == '1':
                        test_health_check(channel)
                    elif choice == '2':
                        url = input("Enter URL: ").strip()
                        if url:
                            test_parse_article(channel, url)
                    elif choice == '3':
                        url = input("Enter URL: ").strip()
                        if url:
                            test_test_url(channel, url)
                    elif choice == '4':
                        test_get_supported_sources(channel)
                    elif choice == '5':
                        print("Enter URLs (one per line, empty line to finish):")
                        urls = []
                        while True:
                            url = input().strip()
                            if not url:
                                break
                            urls.append(url)
                        if urls:
                            test_parse_articles_batch(channel, urls)
                    elif choice == '6':
                        test_health_check(channel)
                        test_get_supported_sources(channel)
                        test_url = input("\nEnter test URL (or press Enter for default): ").strip()
                        if not test_url:
                            test_url = "https://tass.ru/ekonomika/12345678"
                        test_test_url(channel, test_url)
                        test_parse_article(channel, test_url)
                    else:
                        print("Invalid choice")
                        
                except KeyboardInterrupt:
                    print("\n\nExiting...")
                    break
                except EOFError:
                    print("\nExiting...")
                    break
                    
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

