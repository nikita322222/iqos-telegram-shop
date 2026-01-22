import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CartPage = ({ tg }) => {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart()

  const handleCheckout = () => {
    if (cart.length === 0) return
    navigate('/checkout')
  }

  const handleRemoveItem = (item) => {
    if (tg) {
      tg.showConfirm(`Удалить ${item.name} из корзины?`, (confirmed) => {
        if (confirmed) {
          removeFromCart(item.id)
          tg.HapticFeedback.notificationOccurred('success')
        }
      })
    } else {
      if (confirm(`Удалить ${item.name} из корзины?`)) {
        removeFromCart(item.id)
      }
    }
  }

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">Корзина</h1>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>Корзина пуста</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Добавьте товары из каталога
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Корзина</h1>
      
      {/* Прогресс-бар до бесплатной доставки */}
      {getTotalPrice() < 300 && getTotalPrice() > 0 && (
        <div style={{
          background: 'var(--secondary-bg-color)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <span>До бесплатной доставки:</span>
            <span style={{ fontWeight: '600', color: 'var(--button-color)' }}>
              {(300 - getTotalPrice()).toFixed(2)} BYN
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--border-color)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((getTotalPrice() / 300) * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--hint-color)',
            marginTop: '8px',
            textAlign: 'center'
          }}>
            🚚 Добавьте товаров еще на {(300 - getTotalPrice()).toFixed(2)} BYN для бесплатной доставки
          </div>
        </div>
      )}
      
      {getTotalPrice() >= 300 && (
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
          color: 'white',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          🎉 Поздравляем! Вы получили бесплатную доставку!
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img
              src={item.image_url || 'https://via.placeholder.com/80'}
              alt={item.name}
              className="cart-item-image"
            />
            
            <div className="cart-item-info">
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {item.name}
              </div>
              <div style={{ color: 'var(--button-color)', fontWeight: '700' }}>
                {item.price * item.quantity} BYN
              </div>
              
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span style={{ fontWeight: '600' }}>{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  onClick={() => handleRemoveItem(item)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        right: 0,
        padding: '16px',
        background: 'var(--bg-color)',
        borderTop: '1px solid var(--border-color)',
        boxShadow: '0 -2px 10px var(--shadow-color)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          <span>Итого:</span>
          <span>{getTotalPrice()} BYN</span>
        </div>
        
        <button
          onClick={handleCheckout}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Оформить заказ
        </button>
      </div>
    </div>
  )
}

export default CartPage
