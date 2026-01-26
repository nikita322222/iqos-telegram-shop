import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Настройки Telegram WebApp для предотвращения сворачивания при скролле
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp
  
  // Разворачиваем приложение на весь экран
  tg.expand()
  
  // Включаем вертикальные свайпы (предотвращает сворачивание)
  if (typeof tg.enableVerticalSwipes !== 'undefined') {
    tg.enableVerticalSwipes = false
  }
  
  // Отключаем закрытие при свайпе вниз
  tg.isClosingConfirmationEnabled = true
  
  // Устанавливаем цвет заголовка
  tg.setHeaderColor('#FFFFFF')
  
  // Готовность приложения
  tg.ready()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
