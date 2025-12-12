# PWA (Progressive Web App) - Sirius Prism

## ✅ Реализовано

### PWA Функционал

- ✅ **Web App Manifest** (`/public/manifest.json`)
  - Имя приложения: Sirius Prism - AI Newsmaker
  - Иконки для всех размеров
  - Standalone режим (открывается как нативное приложение)
  - Тема: #6366F1 (индиго)

- ✅ **Service Worker** (`/public/service-worker.js`)
  - Кэширование статических ресурсов
  - Offline поддержка
  - Network First для API запросов
  - Cache First для статики
  - Background Sync
  - Push уведомления

- ✅ **Мобильная адаптивность** (`/public/mobile.css`)
  - Touch-friendly интерфейс (мин. 44px tap targets)
  - Safe area support (notch/dynamic island)
  - Pull-to-refresh
  - Swipe gestures
  - Bottom navigation
  - Responsive grid
  - Оптимизация производительности на мобильных

### Meta теги в index.html

```html
<!-- PWA Support -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#6366F1">
<link rel="manifest" href="/manifest.json">

<!-- iOS Support -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">

<!-- Android Support -->
<meta name="mobile-web-app-capable" content="yes">
```

## 🎨 Создание иконок

Для полноценной PWA нужны иконки. Создайте их из одного исходника (512x512px):

### С помощью ImageMagick:

```bash
# Установка
sudo pacman -S imagemagick

# Создание иконок разных размеров
cd frontend/public/icons

# Если у вас есть logo.png (512x512)
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

### Онлайн генератор:

Используйте https://realfavicongenerator.net/ для автоматической генерации всех размеров.

## 📱 Установка PWA

### На Android:

1. Откройте сайт в Chrome
2. Нажмите меню (⋮) → "Установить приложение"
3. Или увидите автоматический prompt

### На iOS:

1. Откройте сайт в Safari
2. Нажмите кнопку "Поделиться" (⬆)
3. Выберите "На экран Домой"

### На Desktop:

1. Откройте сайт в Chrome/Edge
2. В адресной строке появится иконка установки (+)
3. Нажмите "Установить"

## 🚀 Использование

### Service Worker в коде:

```javascript
// Проверка установки PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA');
}

// Ручной вызов установки
window.showInstallPromotion(); // Доступно после beforeinstallprompt
```

### Push уведомления:

```javascript
// Запрос разрешения
const permission = await Notification.requestPermission();

// Подписка на push
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'YOUR_PUBLIC_KEY'
});
```

### Background Sync:

```javascript
// Регистрация sync задачи
if ('sync' in registration) {
  await registration.sync.register('sync-posts');
}
```

## 🎯 Мобильная адаптивность

### Основные фичи:

1. **Touch-friendly**
   - Минимальный размер tap target: 44x44px
   - Active states для touch
   - Swipe gestures

2. **Safe Area Support**
   - Поддержка iPhone notch
   - Dynamic Island на iPhone 14 Pro+
   - Классы: `.safe-area-top`, `.safe-area-bottom`

3. **Responsive Layout**
   - Mobile: 1 колонка
   - Tablet: 2 колонки
   - Desktop: 3+ колонки

4. **Performance**
   - Уменьшенные blur эффекты на mobile
   - Оптимизированные анимации
   - `prefers-reduced-motion` support

5. **Bottom Navigation**
   - Фиксированная навигация внизу экрана
   - Автоматически скрывается при скролле (опционально)

### Классы:

```html
<!-- Показать только на mobile -->
<div class="mobile-only">Mobile content</div>

<!-- Показать только на desktop -->
<div class="desktop-only">Desktop content</div>

<!-- Показать только в PWA режиме -->
<div class="pwa-only">PWA-specific content</div>

<!-- Safe area padding -->
<header class="safe-area-top">Header</header>
<footer class="safe-area-bottom">Footer</footer>
```

## 🔧 Тестирование PWA

### Chrome DevTools:

1. F12 → Application tab
2. Manifest - проверка манифеста
3. Service Workers - проверка SW
4. Storage - проверка кэша

### Lighthouse:

```bash
# Через Chrome DevTools
F12 → Lighthouse → Generate report

# Через CLI
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### PWA Builder:

https://www.pwabuilder.com/ - проверка качества PWA

## 📊 Метрики PWA

Целевые показатели:

- ✅ Installable
- ✅ PWA optimized
- ✅ Works offline
- ✅ Fast loading (<3s)
- ✅ Responsive design
- ✅ HTTPS (требуется в production)

## 🌐 Деплой

### Требования для production PWA:

1. **HTTPS обязателен** (Service Workers работают только по HTTPS)
2. Все ресурсы должны быть доступны
3. manifest.json должен быть доступен по /manifest.json
4. service-worker.js в корне сайта

### Проверка после деплоя:

```bash
# Проверка манифеста
curl https://your-domain.com/manifest.json

# Проверка service worker
curl https://your-domain.com/service-worker.js
```

## 💡 Дополнительные возможности

### Share API:

```javascript
if (navigator.share) {
  await navigator.share({
    title: 'Sirius Prism',
    text: 'Check out this post!',
    url: window.location.href
  });
}
```

### Web Share Target:

Позволяет принимать контент из других приложений (добавить в manifest.json):

```json
"share_target": {
  "action": "/share",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url"
  }
}
```

### App Shortcuts:

```json
"shortcuts": [
  {
    "name": "Создать пост",
    "short_name": "Создать",
    "url": "/create",
    "icons": [{ "src": "/icons/create.png", "sizes": "192x192" }]
  }
]
```

## 🐛 Troubleshooting

### Service Worker не регистрируется:

- Проверьте console на ошибки
- Убедитесь что файл доступен по `/service-worker.js`
- В production нужен HTTPS

### PWA не предлагает установку:

- Проверьте что все критерии выполнены (manifest, icons, SW)
- Lighthouse покажет что не хватает
- iOS требует Safari и "Add to Home Screen"

### Offline не работает:

- Проверьте стратегию кэширования в SW
- Убедитесь что ресурсы добавлены в PRECACHE_URLS
- Проверьте Application → Cache Storage в DevTools

## 📚 Полезные ссылки

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google - PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox - SW Library](https://developers.google.com/web/tools/workbox)

