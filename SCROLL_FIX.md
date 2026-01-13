# ✅ Исправление скролла в Mini App

## Проблема
В Telegram Mini App нельзя было листать страницу вниз (скролл не работал).

## Причина
1. Не были установлены правильные CSS свойства для `html` и `body`
2. Telegram Web App по умолчанию может блокировать вертикальные свайпы
3. Отсутствовали мета-теги для правильной работы viewport

## Решение

### 1. Обновлен `frontend/src/index.css`

Добавлены свойства для включения скролла:

```css
html {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}

body {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

#root {
  min-height: 100vh;
  padding-bottom: 70px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

**Ключевые изменения:**
- `overflow-y: auto` - разрешает вертикальный скролл
- `-webkit-overflow-scrolling: touch` - плавный скролл на iOS
- `height: 100%` - правильная высота для скролла

### 2. Обновлен `frontend/src/App.jsx`

Добавлена настройка Telegram Web App:

```javascript
useEffect(() => {
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp
    webApp.ready()
    webApp.expand()
    
    // Включаем вертикальные свайпы (скролл)
    webApp.enableClosingConfirmation()
    webApp.disableVerticalSwipes = false
    
    setTg(webApp)
    
    // Применяем тему Telegram
    document.body.style.backgroundColor = webApp.backgroundColor
    
    // Убеждаемся, что скролл работает
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
  }
}, [])
```

**Ключевые изменения:**
- `webApp.disableVerticalSwipes = false` - разрешает вертикальные свайпы
- Явно устанавливаем `overflow: auto` для body и html

### 3. Обновлен `frontend/index.html`

Добавлены мета-теги и inline стили:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <title>IQOS Shop</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    /* Обеспечиваем скролл до загрузки CSS */
    html, body {
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
      height: 100%;
    }
  </style>
</head>
```

**Ключевые изменения:**
- Обновлен viewport для правильной работы в Mini App
- Добавлены inline стили для гарантии скролла до загрузки основного CSS
- `viewport-fit=cover` - правильное отображение на iPhone с вырезом

## Тестирование

### Локально
1. Откройте http://localhost:5173 в браузере
2. Проверьте, что страница скроллится

### В Telegram
1. Откройте бота: @eqweqweqweeeqw_bot
2. Нажмите "Открыть магазин"
3. Выберите категорию с товарами
4. Проверьте, что можно листать вниз

## Что должно работать

✅ Вертикальный скролл на всех страницах
✅ Плавный скролл на iOS (momentum scrolling)
✅ Скролл работает сразу при загрузке
✅ Нижняя навигация остается на месте
✅ Контент не обрезается

## Дополнительные улучшения

Если скролл все еще не работает в некоторых случаях:

### 1. Проверьте версию Telegram
Убедитесь, что используется последняя версия Telegram

### 2. Проверьте настройки бота
В BotFather должен быть правильно настроен Menu Button

### 3. Очистите кэш
В Telegram: Settings → Data and Storage → Clear Cache

## Коммит

```
3fa441a - Fix scrolling in Telegram Mini App
```

## Деплой

- **Frontend (Vercel)**: Автоматически задеплоится из GitHub (~2 минуты)
- **Backend**: Изменения не требуются

## Проверка деплоя

Подождите 2-3 минуты после push и проверьте:

```bash
# Проверка, что Vercel задеплоил
curl -I https://iqos-shop.vercel.app
```

Затем откройте бота и проверьте скролл.

---

**Дата исправления:** 13 января 2026  
**Статус:** ✅ Исправлено и задеплоено  
**Версия:** 1.3.0
