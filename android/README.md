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

### Через Android Studio:

1. Откройте проект в Android Studio
2. Build → Generate Signed Bundle / APK
3. Выберите APK
4. Создайте или выберите keystore
5. Build → Build APK(s)

APK будет в: `app/build/outputs/apk/release/app-release.apk`

### Через командную строку:

```bash
# Debug APK (без подписи)
./gradlew assembleDebug

# Release APK (требует keystore)
./gradlew assembleRelease
```

Debug APK: `app/build/outputs/apk/debug/app-debug.apk`

## Быстрая сборка Debug APK

```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

APK будет готов для установки на устройство.

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

