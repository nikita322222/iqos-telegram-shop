import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Настройки Telegram WebApp для предотвращения сворачивания при скролле
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp
  
  // Разворачиваем приложение на весь экран
  tg.expand()
  
  // Включаем вертикальные свайпы (предотвращает сворачивание)
  tg.enableVerticalSwipes = false
  
  // Отключаем закрытие при свайпе вниз
  tg.isClosingConfirmationEnabled = true
  
  // Устанавливаем цвет заголовка в зависимости от темы
  const isDark = tg.colorScheme === 'dark'
  tg.setHeaderColor(isDark ? '#1c1c1e' : '#FFFFFF')
  tg.setBackgroundColor(isDark ? '#000000' : '#FFFFFF')
  
  // Готовность приложения
  tg.ready()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
