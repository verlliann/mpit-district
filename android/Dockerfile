FROM openjdk:17-slim

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Установка Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip -q commandlinetools-linux-9477386_latest.zip && \
    rm commandlinetools-linux-9477386_latest.zip && \
    mv cmdline-tools latest

# Установка Android platform и build-tools
RUN yes | ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    --sdk_root=${ANDROID_SDK_ROOT}

# Рабочая директория
WORKDIR /app

# Копировать проект
COPY . .

# Сборка APK
RUN ./gradlew assembleDebug

# Вывод APK
CMD cp app/build/outputs/apk/debug/app-debug.apk /output/

