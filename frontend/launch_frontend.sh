#!/bin/bash

cd "$(dirname "$0")"

echo "========================================="
echo "🚀 Запуск фронтенда"
echo "========================================="
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"
echo ""

# Установка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    echo ""
fi

# Проверка порта
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Порт 3000 уже занят!"
    echo "   Остановите процесс или измените порт в vite.config.ts"
    echo ""
    lsof -i :3000
    echo ""
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🌐 Запуск dev-сервера..."
echo "   URL: http://localhost:3000"
echo "   Нажмите Ctrl+C для остановки"
echo ""
echo "========================================="
echo ""

npm run dev



