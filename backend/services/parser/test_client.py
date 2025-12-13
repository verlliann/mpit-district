"""Простой клиент для тестирования Parser Service."""

import asyncio
import sys
import os

# Добавляем текущую директорию в путь
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from parser_manager import ParserManager
from utils.user_agents import get_random_user_agent


async def test_parse(url: str):
    """
    Тестирование парсинга статьи.
    
    Args:
        url: URL статьи для парсинга
    """
    print(f"\n{'='*60}")
    print(f"Parsing article: {url}")
    print(f"{'='*60}\n")
    
    manager = ParserManager()
    
    options = {
        'extract_images': True,
        'extract_metadata': True,
        'user_agent': get_random_user_agent(),
        'verify_ssl': False,  # Отключение проверки SSL для тестирования
        'timeout_seconds': 90,  # Увеличенный timeout для Дзена
        'wait_until': 'load',  # Используем 'load' вместо 'networkidle' для скорости
        'block_media': False,  # Не блокируем медиа для Дзена
    }
    
    try:
        print("[INFO] Starting parsing...")
        result = await manager.parse_article(url, options)
        
        print("[OK] Парсинг успешен!\n")
        print(f"Заголовок: {result.get('title', 'N/A')}")
        print(f"Дата публикации: {result.get('published_at', 'N/A')}")
        print(f"Автор: {result.get('author', 'N/A')}")
        print(f"Источник: {result.get('source', 'N/A')}")
        print(f"\nКраткое описание:\n{result.get('excerpt', 'N/A')[:200]}...")
        print(f"\nКонтент (первые 500 символов):\n{result.get('content', 'N/A')[:500]}...")
        print(f"\nИзображений найдено: {len(result.get('images', []))}")
        
        if result.get('images'):
            print("\nИзображения:")
            for i, img in enumerate(result.get('images', [])[:5], 1):
                print(f"  {i}. {img.get('url', 'N/A')[:80]}...")
        
        if result.get('metadata'):
            print(f"\nМетаданные:")
            for key, value in list(result.get('metadata', {}).items())[:5]:
                print(f"  {key}: {value}")
        
        print(f"\nДлина контента: {len(result.get('content', ''))} символов")
        print(f"{'='*60}\n")
        
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Ошибка при парсинге: {error_msg}")
        
        # Полезные советы для пользователя
        if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            print("\n[INFO] Возможные решения:")
            print("  - Сайт требует JavaScript (попробуйте установить Playwright)")
            print("  - Сайт требует авторизацию")
            print("  - Попробуйте другой URL")
        
        if "blocked" in error_msg.lower() or "access denied" in error_msg.lower():
            print("\n[INFO] Сайт заблокировал парсинг:")
            print("  - Сайт требует авторизацию")
            print("  - Сайт использует защиту от ботов (Cloudflare, etc.)")
            print("  - Попробуйте другой URL или используйте прокси")
            print("  - Для некоторых сайтов нужен JavaScript парсер")
        
        if "dzen.ru" in url.lower() or "yandex.ru" in url.lower():
            print("\n[INFO] Дзен/Яндекс часто требует JavaScript парсер.")
            print("  Установите Playwright: pip install playwright")
            print("  Затем: playwright install chromium")
        
        if "vk.com" in url.lower() or "vkontakte" in url.lower():
            print("\n[INFO] ВКонтакте блокирует автоматический парсинг:")
            print("  - Требуется авторизация")
            print("  - Используйте официальный API ВКонтакте")
            print("  - Или попробуйте другой источник")
        
        import traceback
        traceback.print_exc()


def main():
    """Главная функция для интерактивного тестирования."""
    import sys
    
    print("=" * 60)
    print("Parser Service - Test Client")
    print("=" * 60)
    
    # Если передан URL как аргумент командной строки
    if len(sys.argv) > 1:
        url = sys.argv[1]
        asyncio.run(test_parse(url))
        return
    
    print("\nВведите URL статьи для парсинга (или 'exit' для выхода)")
    
    while True:
        try:
            url = input("\nURL: ").strip()
            
            if not url:
                continue
            
            if url.lower() in ['exit', 'quit', 'q']:
                print("Выход...")
                break
            
            if not url.startswith(('http://', 'https://')):
                print("[WARNING] URL должен начинаться с http:// или https://")
                continue
            
            asyncio.run(test_parse(url))
            
        except KeyboardInterrupt:
            print("\n\nВыход...")
            break
        except EOFError:
            print("\nВыход...")
            break
        except Exception as e:
            print(f"[ERROR] Ошибка: {e}")


if __name__ == '__main__':
    main()
