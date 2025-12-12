#!/bin/bash

echo "🔨 Сборка Sirius Prism APK..."
echo "URL: http://172.21.95.253:3000"
echo ""

# Проверка Java
if ! command -v java &> /dev/null; then
    echo "❌ Java не найдена. Установите JDK 8+:"
    echo "   sudo pacman -S jdk-openjdk"
    exit 1
fi

echo "✅ Java найдена: $(java -version 2>&1 | head -1)"

# Делаем gradlew исполняемым
chmod +x gradlew

# Сборка Debug APK
echo ""
echo "📦 Сборка debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK готов!"
    echo "📁 Путь: app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📱 Установка на устройство:"
    echo "   adb install -r app/build/outputs/apk/debug/app-debug.apk"
    
    # Показываем размер APK
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
        echo "   Размер: $SIZE"
    fi
else
    echo ""
    echo "❌ Ошибка сборки"
    exit 1
fi

