#!/bin/bash

cd "$(dirname "$0")"

echo "🔍 Проверка окружения..."
echo "Node version: $(node --version 2>/dev/null || echo 'Node не установлен')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'NPM не установлен')"
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    echo ""
fi

echo "🚀 Запуск Vite dev-сервера..."
echo "   Сервер будет доступен на: http://localhost:3000"
echo "   Нажмите Ctrl+C для остановки"
echo ""

npm run dev



