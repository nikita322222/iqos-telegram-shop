import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'

const CheckoutPage = ({ tg }) => {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()
  const [isOrdering, setIsOrdering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deliveryType, setDeliveryType] = useState('minsk')
  const [errors, setErrors] = useState({})
  
  // Бонусы
  const [bonusBalance, setBonusBalance] = useState(0)
  const [bonusToUse, setBonusToUse] = useState(0)
  const [useBonuses, setUseBonuses] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    payment_method: 'cash',
    delivery_address: '',
    delivery_time: '13:00-17:00',
    delivery_date: '',
    city: '',
    europost_office: '',
    comment: ''
  })

  // Загрузка сохраненных данных пользователя и бонусов
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.getCurrentUser()
        const userData = response.data
        
        // Загружаем баланс бонусов
        setBonusBalance(userData.bonus_balance || 0)
        
        // Автозаполнение сохраненных данных
        if (userData.saved_full_name || userData.saved_phone) {
          setFormData(prev => ({
            ...prev,
            full_name: userData.saved_full_name || '',
            phone: userData.saved_phone || '',
            delivery_address: userData.saved_delivery_address || '',
            city: userData.saved_city || '',
            europost_office: userData.saved_europost_office || ''
          }))
          
          // Устанавливаем тип доставки из последнего заказа
          if (userData.saved_delivery_type) {
            setDeliveryType(userData.saved_delivery_type)
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  const validateForm = () => {
    const newErrors = {}
    
    // Проверка ФИО
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Введите ФИО'
    } else if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'ФИО слишком короткое'
    }
    
    // Проверка телефона
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон'
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона'
    }
    
    // Проверка полей доставки
    if (deliveryType === 'minsk') {
      if (!formData.delivery_address.trim()) {
        newErrors.delivery_address = 'Введите адрес доставки'
      }
      if (!formData.delivery_time) {
        newErrors.delivery_time = 'Выберите время доставки'
      }
      if (!formData.delivery_date) {
        newErrors.delivery_date = 'Выберите дату доставки'
      }
    } else if (deliveryType === 'europost') {
      if (!formData.city.trim()) {
        newErrors.city = 'Введите город'
      }
      if (!formData.europost_office.trim()) {
        newErrors.europost_office = 'Введите отделение'
      }
      if (!formData.delivery_date) {
        newErrors.delivery_date = 'Выберите дату отправки'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0]
      if (tg) {
        tg.showAlert(firstError)
      } else {
        alert(firstError)
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
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        payment_method: formData.payment_method,
        delivery_address: deliveryType === 'minsk' ? formData.delivery_address.trim() : null,
        delivery_time: deliveryType === 'minsk' ? formData.delivery_time : null,
        delivery_date: deliveryType === 'minsk' && formData.delivery_date ? formData.delivery_date : null,
        city: deliveryType === 'europost' ? formData.city.trim() : null,
        europost_office: deliveryType === 'europost' ? formData.europost_office.trim() : null,
        comment: formData.comment.trim() || null,
        bonus_to_use: useBonuses ? bonusToUse : 0
      }

      await api.createOrder(orderPayload)
      
      if (tg) {
        tg.showAlert('✅ Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.')
      } else {
        alert('✅ Заказ успешно оформлен!')
      }
      
      clearCart()
      navigate('/profile')
    } catch (error) {
      console.error('Ошибка оформления заказа:', error)
      
      let errorMessage = 'Ошибка при оформлении заказа'
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(e => e.msg).join(', ')
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (tg) {
        tg.showAlert('❌ ' + errorMessage)
      } else {
        alert('❌ ' + errorMessage)
      }
    } finally {
      setIsOrdering(false)
    }
  }

  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  if (isLoading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Оформление заказа</h1>
      
      {/* Выбор типа доставки */}
      <div className="form-section">
        <h3 className="section-subtitle">Тип доставки</h3>
        <div className="delivery-type-selector">
          <button
            type="button"
            onClick={() => setDeliveryType('minsk')}
            className={`delivery-type-btn ${deliveryType === 'minsk' ? 'active' : ''}`}
          >
            <span className="btn-icon">🚚</span>
            <span className="btn-text">Доставка по Минску</span>
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType('europost')}
            className={`delivery-type-btn ${deliveryType === 'europost' ? 'active' : ''}`}
          >
            <span className="btn-icon">📦</span>
            <span className="btn-text">Евро почта</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Общие поля */}
        <div className="form-section">
          <h3 className="section-subtitle">Контактные данные</h3>
          
          <div className="form-group">
            <label className="form-label">
              Ваше ФИО <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Иванов Иван Иванович"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className={`form-input ${errors.full_name ? 'error' : ''}`}
            />
            {errors.full_name && <div className="error-message">{errors.full_name}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Контактный телефон <span className="required">*</span>
            </label>
            <input
              type="tel"
              placeholder="+375 (29) 123-45-67"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`form-input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
        </div>

        {/* Доставка по Минску */}
        {deliveryType === 'minsk' && (
          <div className="form-section">
            <h3 className="section-subtitle">Адрес доставки</h3>
            
            <div className="form-group">
              <label className="form-label">
                Адрес доставки <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="ул. Примерная, д. 1, кв. 1"
                value={formData.delivery_address}
                onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                className={`form-input ${errors.delivery_address ? 'error' : ''}`}
              />
              {errors.delivery_address && <div className="error-message">{errors.delivery_address}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Время доставки <span className="required">*</span>
              </label>
              <select
                value={formData.delivery_time}
                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                className="form-input"
              >
                <option value="13:00-17:00">13:00 - 17:00</option>
                <option value="17:00-21:00">17:00 - 21:00</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Дата доставки <span className="required">*</span>
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className={`form-input ${errors.delivery_date ? 'error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.delivery_date && <div className="error-message">{errors.delivery_date}</div>}
              <div className="info-message">
                ℹ️ Заказы, оформленные до 12:45, будут доставлены сегодня в выбранный промежуток времени
              </div>
            </div>
          </div>
        )}

        {/* Евро почта */}
        {deliveryType === 'europost' && (
          <div className="form-section">
            <h3 className="section-subtitle">Данные для отправки</h3>
            
            <div className="form-group">
              <label className="form-label">
                Город <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Минск"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`form-input ${errors.city ? 'error' : ''}`}
              />
              {errors.city && <div className="error-message">{errors.city}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Отделение Евро почты <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="№ 123"
                value={formData.europost_office}
                onChange={(e) => handleInputChange('europost_office', e.target.value)}
                className={`form-input ${errors.europost_office ? 'error' : ''}`}
              />
              {errors.europost_office && <div className="error-message">{errors.europost_office}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Дата отправки <span className="required">*</span>
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className={`form-input ${errors.delivery_date ? 'error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.delivery_date && <div className="error-message">{errors.delivery_date}</div>}
            </div>
          </div>
        )}

        {/* Способ оплаты */}
        <div className="form-section">
          <h3 className="section-subtitle">Способ оплаты</h3>
          <div className="payment-selector">
            <button
              type="button"
              onClick={() => handleInputChange('payment_method', 'cash')}
              className={`payment-btn ${formData.payment_method === 'cash' ? 'active' : ''}`}
            >
              <span className="btn-icon">💵</span>
              <span className="btn-text">Наличные</span>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('payment_method', 'usdt')}
              className={`payment-btn ${formData.payment_method === 'usdt' ? 'active' : ''}`}
            >
              <span className="btn-icon">💎</span>
              <span className="btn-text">USDT</span>
            </button>
          </div>
        </div>

        {/* Комментарий */}
        <div className="form-section">
          <h3 className="section-subtitle">Комментарий</h3>
          <div className="form-group">
            <textarea
              placeholder="Дополнительная информация к заказу (необязательно)"
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              className="form-input form-textarea"
              rows="3"
            />
          </div>
        </div>

        {/* Бонусы */}
        {bonusBalance > 0 && (
          <div className="form-section">
            <h3>💰 Использовать бонусы</h3>
            <div className="bonus-section">
              <div className="bonus-info">
                <span>Доступно бонусов:</span>
                <span className="bonus-balance">{bonusBalance.toFixed(2)} ₽</span>
              </div>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useBonuses}
                  onChange={(e) => {
                    setUseBonuses(e.target.checked)
                    if (e.target.checked) {
                      const maxBonus = Math.min(bonusBalance, getTotalPrice())
                      setBonusToUse(maxBonus)
                    } else {
                      setBonusToUse(0)
                    }
                  }}
                />
                <span>Использовать бонусы для оплаты</span>
              </label>

              {useBonuses && (
                <div className="bonus-input-group">
                  <label>Сумма бонусов:</label>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(bonusBalance, getTotalPrice())}
                    step="0.01"
                    value={bonusToUse}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      const maxBonus = Math.min(bonusBalance, getTotalPrice())
                      setBonusToUse(Math.min(value, maxBonus))
                    }}
                    className="form-input"
                  />
                  <div className="bonus-hint">
                    Максимум: {Math.min(bonusBalance, getTotalPrice()).toFixed(2)} ₽
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Итого */}
        <div className="checkout-footer">
          <div className="total-section">
            {useBonuses && bonusToUse > 0 && (
              <>
                <div className="total-row">
                  <span className="total-label">Сумма заказа:</span>
                  <span className="total-amount">{getTotalPrice()} BYN</span>
                </div>
                <div className="total-row bonus-discount">
                  <span className="total-label">Списано бонусов:</span>
                  <span className="total-amount">-{bonusToUse.toFixed(2)} BYN</span>
                </div>
                <div className="total-row final-total">
                  <span className="total-label">К оплате:</span>
                  <span className="total-amount">{(getTotalPrice() - bonusToUse).toFixed(2)} BYN</span>
                </div>
              </>
            )}
            {(!useBonuses || bonusToUse === 0) && (
              <div className="total-row">
                <span className="total-label">Итого:</span>
                <span className="total-amount">{getTotalPrice()} BYN</span>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isOrdering}
            className="btn btn-primary btn-submit"
          >
            {isOrdering ? '⏳ Оформление...' : '✅ Подтвердить заказ'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
