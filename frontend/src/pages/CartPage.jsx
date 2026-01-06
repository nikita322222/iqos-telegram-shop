import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'

const CartPage = ({ tg }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [isOrdering, setIsOrdering] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderData, setOrderData] = useState({
    phone: '',
    address: '',
    comment: ''
  })

  const handleOrder = async () => {
    if (cart.length === 0) return

    if (!showOrderForm) {
      setShowOrderForm(true)
      return
    }

    if (!orderData.phone || !orderData.address) {
      if (tg) {
        tg.showAlert('Заполните телефон и адрес доставки')
      }
      return
    }

    setIsOrdering(true)
    
    try {
      const orderPayload = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        phone: orderData.phone,
        delivery_address: orderData.address,
        comment: orderData.comment
      }

      await api.createOrder(orderPayload)
      
      if (tg) {
        tg.showAlert('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.')
      }
      
      clearCart()
      setShowOrderForm(false)
      setOrderData({ phone: '', address: '', comment: '' })
    } catch (error) {
      console.error('Ошибка оформления заказа:', error)
      if (tg) {
        tg.showAlert('Ошибка при оформлении заказа')
      }
    } finally {
      setIsOrdering(false)
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
              <div style={{ color: 'var(--tg-theme-button-color)', fontWeight: '700' }}>
                {item.price * item.quantity} ₽
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
                  onClick={() => removeFromCart(item.id)}
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

      {showOrderForm && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '12px' }}>Данные для доставки</h3>
          
          <input
            type="tel"
            placeholder="Телефон"
            value={orderData.phone}
            onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid var(--tg-theme-hint-color)',
              borderRadius: '8px',
              fontSize: '16px',
              background: 'var(--tg-theme-bg-color)',
              color: 'var(--tg-theme-text-color)'
            }}
          />
          
          <input
            type="text"
            placeholder="Адрес доставки"
            value={orderData.address}
            onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid var(--tg-theme-hint-color)',
              borderRadius: '8px',
              fontSize: '16px',
              background: 'var(--tg-theme-bg-color)',
              color: 'var(--tg-theme-text-color)'
            }}
          />
          
          <textarea
            placeholder="Комментарий к заказу (необязательно)"
            value={orderData.comment}
            onChange={(e) => setOrderData({ ...orderData, comment: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid var(--tg-theme-hint-color)',
              borderRadius: '8px',
              fontSize: '16px',
              minHeight: '80px',
              background: 'var(--tg-theme-bg-color)',
              color: 'var(--tg-theme-text-color)',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        right: 0,
        padding: '16px',
        background: 'var(--tg-theme-bg-color)',
        borderTop: '1px solid var(--tg-theme-hint-color)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          <span>Итого:</span>
          <span>{getTotalPrice()} ₽</span>
        </div>
        
        <button
          onClick={handleOrder}
          disabled={isOrdering}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {isOrdering ? 'Оформление...' : showOrderForm ? 'Подтвердить заказ' : 'Оформить заказ'}
        </button>
      </div>
    </div>
  )
}

export default CartPage
