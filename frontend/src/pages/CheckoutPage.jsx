import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'

const CheckoutPage = ({ tg }) => {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()
  const [isOrdering, setIsOrdering] = useState(false)
  const [deliveryType, setDeliveryType] = useState('minsk') // minsk, europost
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    payment_method: 'cash',
    
    // Минск
    delivery_address: '',
    delivery_time: '13:00-17:00',
    delivery_date: '',
    
    // Евро почта
    city: '',
    europost_office: '',
    
    comment: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валидация
    if (!formData.full_name || !formData.phone) {
      if (tg) {
        tg.showAlert('Заполните ФИО и телефон')
      }
      return
    }
    
    if (deliveryType === 'minsk' && !formData.delivery_address) {
      if (tg) {
        tg.showAlert('Заполните адрес доставки')
      }
      return
    }
    
    if (deliveryType === 'europost' && (!formData.city || !formData.europost_office)) {
      if (tg) {
        tg.showAlert('Заполните город и отделение Евро почты')
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
        delivery_type: deliveryType,
        full_name: formData.full_name,
        phone: formData.phone,
        payment_method: formData.payment_method,
        delivery_address: deliveryType === 'minsk' ? formData.delivery_address : null,
        delivery_time: deliveryType === 'minsk' ? formData.delivery_time : null,
        delivery_date: deliveryType === 'minsk' ? formData.delivery_date : null,
        city: deliveryType === 'europost' ? formData.city : null,
        europost_office: deliveryType === 'europost' ? formData.europost_office : null,
        comment: formData.comment
      }

      await api.createOrder(orderPayload)
      
      if (tg) {
        tg.showAlert('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.')
      }
      
      clearCart()
      navigate('/profile')
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
    navigate('/cart')
    return null
  }

  return (
    <div style={{ paddingBottom: '100px' }}>
      <h1 className="page-title">Оформление заказа</h1>
      
      {/* Выбор типа доставки */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Тип доставки</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setDeliveryType('minsk')}
            className={`delivery-type-btn ${deliveryType === 'minsk' ? 'active' : ''}`}
          >
            🚚 Доставка по Минску
          </button>
          <button
            onClick={() => setDeliveryType('europost')}
            className={`delivery-type-btn ${deliveryType === 'europost' ? 'active' : ''}`}
          >
            📦 Евро почта
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Общие поля */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Контактные данные</h3>
          
          <input
            type="text"
            placeholder="Ваше ФИО *"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="form-input"
            required
          />
          
          <input
            type="tel"
            placeholder="Контактный телефон *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-input"
            required
          />
        </div>

        {/* Доставка по Минску */}
        {deliveryType === 'minsk' && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Адрес доставки</h3>
            
            <input
              type="text"
              placeholder="Адрес доставки *"
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              className="form-input"
              required
            />
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Время доставки *
              </label>
              <select
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="form-input"
                required
              >
                <option value="13:00-17:00">13:00-17:00</option>
                <option value="17:00-21:00">17:00-21:00</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Дата доставки
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="form-input"
              />
              <div style={{
                fontSize: '12px',
                color: 'var(--tg-theme-hint-color)',
                marginTop: '8px',
                padding: '8px',
                background: 'var(--tg-theme-secondary-bg-color)',
                borderRadius: '8px'
              }}>
                ℹ️ Заказы, оформленные до 12:45, будут доставлены сегодня в выбранный промежуток времени
              </div>
            </div>
          </div>
        )}

        {/* Евро почта */}
        {deliveryType === 'europost' && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Данные для отправки</h3>
            
            <input
              type="text"
              placeholder="Город *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="form-input"
              required
            />
            
            <input
              type="text"
              placeholder="Отделение Евро почты *"
              value={formData.europost_office}
              onChange={(e) => setFormData({ ...formData, europost_office: e.target.value })}
              className="form-input"
              required
            />
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Дата отправки
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Способ оплаты */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Способ оплаты</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, payment_method: 'cash' })}
              className={`payment-btn ${formData.payment_method === 'cash' ? 'active' : ''}`}
            >
              💵 Наличные
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, payment_method: 'usdt' })}
              className={`payment-btn ${formData.payment_method === 'usdt' ? 'active' : ''}`}
            >
              💎 USDT
            </button>
          </div>
        </div>

        {/* Комментарий */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Комментарий</h3>
          <textarea
            placeholder="Комментарий к заказу (необязательно)"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="form-input"
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        {/* Итого */}
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
            <span>{getTotalPrice()} BYN</span>
          </div>
          
          <button
            type="submit"
            disabled={isOrdering}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {isOrdering ? 'Оформление...' : 'Подтвердить заказ'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
