#!/bin/bash

cd "$(dirname "$0")"

echo "Установка зависимостей..."
npm install

echo "Запуск dev-сервера на порту 3000..."
npm run dev



