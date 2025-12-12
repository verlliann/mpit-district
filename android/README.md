# Sirius Prism - Android WebView App

Android приложение с WebView для доступа к AI-Newsmaker платформе.

## Параметры

- **Название:** Sirius Prism
- **Package:** com.siriusprism
- **URL:** http://172.21.95.253:3000
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)

## Требования

- Android Studio Arctic Fox или новее
- JDK 8 или новее
- Android SDK 34

## Сборка APK

### ⚠️ Требования

Для сборки нужен **Android SDK**. Выберите один из вариантов:

### Вариант 1: Через Docker (РЕКОМЕНДУЕТСЯ - без установки SDK)

```bash
cd android
./build-docker.sh
```

APK будет в: `output/app-debug.apk`

### Вариант 2: С Android Studio

1. Установите Android Studio: `yay -S android-studio`
2. Запустите Android Studio и установите Android SDK
3. Откройте проект в Android Studio
4. Build → Build APK(s)

APK будет в: `app/build/outputs/apk/debug/app-debug.apk`

### Вариант 3: С Android SDK (командная строка)

```bash
# Установите Android SDK
yay -S android-sdk android-sdk-platform-tools android-sdk-build-tools

# Или скачайте вручную:
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip -d ~/Android
mkdir -p ~/Android/Sdk/cmdline-tools/latest
mv ~/Android/cmdline-tools/* ~/Android/Sdk/cmdline-tools/latest/

# Установите платформы
~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager \
  "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Создайте local.properties
echo "sdk.dir=$HOME/Android/Sdk" > local.properties

# Соберите APK
./gradlew assembleDebug
```

APK будет в: `app/build/outputs/apk/debug/app-debug.apk`

## Установка

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Особенности

- WebView с включенным JavaScript
- Поддержка localStorage и sessionStorage
- Кэширование для офлайн работы
- Обработка кнопки "Назад"
- Полноэкранный режим
- Поддержка HTTP (cleartext traffic)

## Изменение URL

Отредактируйте `app/src/main/java/com/siriusprism/MainActivity.java`:

```java
private static final String URL = "http://172.21.95.253:3000";
```

## Иконка приложения

Для замены иконки добавьте файлы в:
- `app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

