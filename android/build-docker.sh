#!/bin/bash

echo "🐳 Сборка Sirius Prism APK через Docker"
echo "URL: http://172.21.95.253:3000"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    echo "Установите: sudo pacman -S docker"
    exit 1
fi

# Создать директорию для output
mkdir -p output

# Сборка Docker image и APK
echo "📦 Сборка APK в Docker контейнере..."
docker build -t sirius-prism-builder . && \
docker run --rm -v "$(pwd)/output:/output" sirius-prism-builder

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK готов!"
    echo "📁 Путь: output/app-debug.apk"
    
    if [ -f "output/app-debug.apk" ]; then
        SIZE=$(du -h output/app-debug.apk | cut -f1)
        echo "   Размер: $SIZE"
        echo ""
        echo "📱 Установка:"
        echo "   adb install -r output/app-debug.apk"
    fi
else
    echo ""
    echo "❌ Ошибка сборки"
    exit 1
fi

