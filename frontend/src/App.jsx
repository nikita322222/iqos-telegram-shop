import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import FavoritesPage from './pages/FavoritesPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import { CartProvider } from './context/CartContext'

function App() {
  const [tg, setTg] = useState(null)

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      webApp.ready()
      webApp.expand()
      setTg(webApp)
      
      // Применяем тему Telegram
      document.body.style.backgroundColor = webApp.backgroundColor
    }
  }, [])

  return (
    <CartProvider>
      <Router>
        <Layout tg={tg}>
          <Routes>
            <Route path="/" element={<HomePage tg={tg} />} />
            <Route path="/catalog" element={<CatalogPage tg={tg} />} />
            <Route path="/favorites" element={<FavoritesPage tg={tg} />} />
            <Route path="/cart" element={<CartPage tg={tg} />} />
            <Route path="/profile" element={<ProfilePage tg={tg} />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  )
}

export default App
