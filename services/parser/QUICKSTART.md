# Быстрый старт - Тестирование Parser Service

## Установка

### Windows (PowerShell)

```powershell
# Создание виртуального окружения
python -m venv venv

# Активация
.\venv\Scripts\Activate.ps1

# Установка зависимостей
pip install -r requirements.txt

# Установка браузеров для Playwright
playwright install chromium
playwright install-deps chromium

# Генерация gRPC кода
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/common.proto proto/parser.proto
```

### Linux/Mac

```bash
# Создание виртуального окружения
python3 -m venv venv

# Активация
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Установка браузеров для Playwright
playwright install chromium
playwright install-deps chromium

# Генерация gRPC кода
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/common.proto proto/parser.proto
```

## Запуск тестового клиента

После установки запустите:

```bash
python test_client.py
```

Затем введите URL статьи для парсинга, например:
- `https://tass.ru/ekonomika/12345678`
- `https://ria.ru/20231210/novost-1234567890.html`
- `https://lenta.ru/news/2023/12/10/article`

## Примеры использования

### Тестирование конкретного URL

```python
import asyncio
from parser_manager import ParserManager

async def test():
    manager = ParserManager()
    result = await manager.parse_article(
        "https://tass.ru/ekonomika/12345678",
        {'extract_images': True}
    )
    print(result['title'])
    print(result['content'][:500])

asyncio.run(test())
```

## Структура результата

После парсинга вы получите словарь с полями:

- `title` - заголовок статьи
- `content` - основной текст
- `excerpt` - краткое описание
- `author` - автор
- `published_at` - дата публикации (timestamp)
- `source` - домен источника
- `images` - список изображений
- `metadata` - дополнительные метаданные

## Устранение проблем

### Ошибка импорта proto модулей

Убедитесь, что вы сгенерировали gRPC код:
```bash
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/common.proto proto/parser.proto
```

### Playwright не работает

Установите браузеры:
```bash
playwright install chromium
```

### Ошибки парсинга

- Проверьте, что URL доступен
- Некоторые сайты могут блокировать автоматические запросы
- Для JavaScript-сайтов убедитесь, что Playwright установлен

