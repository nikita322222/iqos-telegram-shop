import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Orders from './pages/Orders'
import Customers from './pages/Customers'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="nav desktop-nav">
        <div className="nav-content">
          <div className="nav-title">👑 IQOS Admin</div>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              📊 Dashboard
            </Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
              📦 Товары
            </Link>
            <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>
              🏷️ Категории
            </Link>
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
              📋 Заказы
            </Link>
            <Link to="/customers" className={`nav-link ${isActive('/customers') ? 'active' : ''}`}>
              👥 Клиенты
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="mobile-nav-icon">📊</div>
          <div className="mobile-nav-label">Dashboard</div>
        </Link>
        <Link to="/products" className={`mobile-nav-item ${isActive('/products') ? 'active' : ''}`}>
          <div className="mobile-nav-icon">📦</div>
          <div className="mobile-nav-label">Товары</div>
        </Link>
        <Link to="/categories" className={`mobile-nav-item ${isActive('/categories') ? 'active' : ''}`}>
          <div className="mobile-nav-icon">🏷️</div>
          <div className="mobile-nav-label">Категории</div>
        </Link>
        <Link to="/orders" className={`mobile-nav-item ${isActive('/orders') ? 'active' : ''}`}>
          <div className="mobile-nav-icon">📋</div>
          <div className="mobile-nav-label">Заказы</div>
        </Link>
        <Link to="/customers" className={`mobile-nav-item ${isActive('/customers') ? 'active' : ''}`}>
          <div className="mobile-nav-icon">👥</div>
          <div className="mobile-nav-label">Клиенты</div>
        </Link>
      </nav>
    </>
  )
}

function App() {
  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      // Применяем тему
      if (tg.colorScheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      }
    }
  }, [])

  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
