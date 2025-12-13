# Запуск фронтенда

## Быстрый запуск

```bash
cd /Users/nikita/Desktop/mpit/frontend
npm install  # если зависимости не установлены
npm run dev
```

Сервер запустится на **http://localhost:3000**

## Проверка статуса

Если сервер не открывается:

1. Проверьте, что порт 3000 свободен:
   ```bash
   lsof -i :3000
   ```

2. Проверьте логи в терминале, где запущен `npm run dev`

3. Убедитесь, что Node.js установлен:
   ```bash
   node --version  # должна быть версия 18+
   npm --version
   ```

## Переменные окружения (опционально)

Создайте файл `.env` в папке `frontend`:
```
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_GRAPHQL_WS_URL=ws://localhost:4000/graphql
GEMINI_API_KEY=your_key_here  # опционально
```

## Устранение проблем

- Если порт занят, измените порт в `vite.config.ts` (строка 9)
- Если есть ошибки компиляции, проверьте версии зависимостей в `package.json`
- Если GraphQL не подключается, убедитесь, что backend запущен на порту 4000



