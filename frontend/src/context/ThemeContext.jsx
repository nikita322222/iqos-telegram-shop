import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Загружаем сохраненную тему из localStorage
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    // Применяем тему к body
    document.body.setAttribute('data-theme', theme)
    // Сохраняем в localStorage
    localStorage.setItem('theme', theme)
    
    // Обновляем цвет header в Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      const isDark = theme === 'dark'
      tg.setHeaderColor(isDark ? '#1c1c1e' : '#FFFFFF')
      tg.setBackgroundColor(isDark ? '#000000' : '#FFFFFF')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
