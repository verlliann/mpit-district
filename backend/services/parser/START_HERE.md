# 🚀 Быстрый старт - Тестирование Parser Service

## Шаг 1: Установка зависимостей

### Windows (PowerShell)

```powershell
# Перейдите в папку сервиса
cd services\parser

# Создайте виртуальное окружение
python -m venv venv

# Активируйте его
.\venv\Scripts\Activate.ps1

# Или используйте готовый скрипт
pip install -r requirements.txt
```

### Linux/Mac

```bash
cd services/parser
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/common.proto proto/parser.proto
```

## Шаг 2: Генерация gRPC кода

После установки зависимостей нужно сгенерировать код из .proto файлов:

```bash
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/common.proto proto/parser.proto
```

Это создаст файлы:
- `proto/common_pb2.py`
- `proto/common_pb2_grpc.py`
- `proto/parser_pb2.py`
- `proto/parser_pb2_grpc.py`

## Шаг 3: Запуск сервиса

### Запуск gRPC сервера

```bash
python server.py
```

Это запустит:
- **gRPC сервер** на порту `50051` (по умолчанию)

Вы можете изменить порт через переменную окружения:
```bash
set GRPC_PORT=50051
python server.py
```

### Проверка Health Check

Используйте gRPC клиент для проверки (HealthCheck доступен через gRPC):

```bash
# Запуск gRPC клиента
python grpc_client.py

# Или быстрая проверка всех методов
python grpc_client.py --test-all

# Или проверка конкретного URL
python grpc_client.py --url https://tass.ru/ekonomika/12345678
```

## Шаг 4: Запуск тестового клиента

```bash
python test_client.py
```

## Шаг 4: Введите URL для тестирования

После запуска клиента введите URL статьи, например:

```
https://tass.ru/ekonomika/12345678
https://ria.ru/20231210/novost-1234567890.html
https://lenta.ru/news/2023/12/10/article
```

## Что вы увидите

После парсинга вы получите:
- ✅ Заголовок статьи
- ✅ Автор и дата публикации
- ✅ Краткое описание
- ✅ Основной текст (первые 500 символов)
- ✅ Список найденных изображений
- ✅ Метаданные

## Примеры тестовых URL

### Российские новостные сайты:
- TASS: `https://tass.ru/ekonomika/...`
- РИА Новости: `https://ria.ru/...`
- Lenta.ru: `https://lenta.ru/news/...`
- РБК: `https://www.rbc.ru/...`

### Международные:
- BBC: `https://www.bbc.com/news/...`
- The Guardian: `https://www.theguardian.com/...`

## Устранение проблем

### Ошибка: "No module named 'proto'"
Выполните генерацию gRPC кода (Шаг 2)

### Ошибка: "Playwright browser not found"
```bash
playwright install chromium
```

### Ошибка парсинга конкретного сайта
- Проверьте доступность URL
- Некоторые сайты блокируют автоматические запросы
- Попробуйте другой URL

## Выход из программы

Введите `exit` или нажмите `Ctrl+C`

