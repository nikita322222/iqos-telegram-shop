import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Layout = ({ children, tg }) => {
  const location = useLocation()
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()

  const navItems = [
    { path: '/catalog', label: 'Скидки', icon: '🏷️' },
    { path: '/favorites', label: 'Избранное', icon: '❤️' },
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/cart', label: 'Корзина', icon: '🛒', badge: cartCount },
    { path: '/profile', label: 'Профиль', icon: '👤' },
  ]

  return (
    <div>
      <main className="container">
        {children}
      </main>
      
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div style={{ position: 'relative' }}>
              <span className="nav-icon">{item.icon}</span>
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  background: '#ff3b30',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Layout
