import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import FavoritesPage from './pages/FavoritesPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import { CartProvider } from './context/CartContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Переключить тему"
    >
      <span className="theme-toggle-icon">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="theme-toggle-text">
        {theme === 'light' ? 'Темная' : 'Светлая'}
      </span>
    </button>
  )
}

function AppContent() {
  const [tg, setTg] = useState(null)

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      webApp.ready()
      webApp.expand()
      
      // КРИТИЧНО: Разрешаем вертикальный скролл
      if (webApp.isVerticalSwipesEnabled !== undefined) {
        webApp.isVerticalSwipesEnabled = true
      }
      
      setTg(webApp)
      
      // Принудительно включаем скролл
      document.documentElement.style.overflow = 'scroll'
      document.documentElement.style.overflowX = 'hidden'
      document.body.style.overflow = 'scroll'
      document.body.style.overflowX = 'hidden'
    } else {
      // Если не в Telegram, тоже включаем скролл
      document.documentElement.style.overflow = 'scroll'
      document.body.style.overflow = 'scroll'
    }
  }, [])

  return (
    <CartProvider>
      <Router>
        <ThemeToggle />
        <Layout tg={tg}>
          <Routes>
            <Route path="/" element={<CatalogPage tg={tg} />} />
            <Route path="/catalog" element={<CatalogPage tg={tg} />} />
            <Route path="/product/:id" element={<ProductPage tg={tg} />} />
            <Route path="/favorites" element={<FavoritesPage tg={tg} />} />
            <Route path="/cart" element={<CartPage tg={tg} />} />
            <Route path="/checkout" element={<CheckoutPage tg={tg} />} />
            <Route path="/profile" element={<ProfilePage tg={tg} />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
