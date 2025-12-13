#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "📦 Проверка зависимостей..."
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
else
    echo "✅ Зависимости уже установлены"
fi

echo ""
echo "🚀 Запуск dev-сервера на http://localhost:3000"
echo "   Нажмите Ctrl+C для остановки"
echo ""

npm run dev






