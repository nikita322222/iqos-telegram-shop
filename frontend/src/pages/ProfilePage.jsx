import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import SkeletonLoader from '../components/SkeletonLoader'

const ProfilePage = ({ tg }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    name: '',
    delivery_type: 'minsk',
    address: '',
    city: '',
    europost_office: '',
    is_default: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userRes, ordersRes, addressesRes] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getOrders().catch(() => ({ data: [] })),
        api.getSavedAddresses().catch(() => ({ data: [] }))
      ])
      
      if (userRes) setUser(userRes.data)
      setOrders(ordersRes.data)
      setSavedAddresses(addressesRes.data)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = (order) => {
    // Добавляем все товары из заказа в корзину
    order.items.forEach(item => {
      addToCart(item.product, item.quantity)
    })
    
    if (tg) {
      tg.showAlert(`✅ Добавлено ${order.items.length} товаров в корзину!`)
      tg.HapticFeedback.notificationOccurred('success')
    }
    
    // Переходим в корзину
    navigate('/cart')
  }

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        await api.updateSavedAddress(editingAddress.id, addressForm)
      } else {
        await api.createSavedAddress(addressForm)
      }
      
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        name: '',
        delivery_type: 'minsk',
        address: '',
        city: '',
        europost_office: '',
        is_default: false
      })
      loadData()
      
      if (tg) {
        tg.showAlert('✅ Адрес сохранен!')
      }
    } catch (error) {
      console.error('Ошибка сохранения адреса:', error)
      if (tg) {
        tg.showAlert('❌ Ошибка сохранения адреса')
      }
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (tg) {
      tg.showConfirm('Удалить этот адрес?', async (confirmed) => {
        if (confirmed) {
          try {
            await api.deleteSavedAddress(addressId)
            loadData()
            tg.showAlert('✅ Адрес удален')
          } catch (error) {
            console.error('Ошибка удаления адреса:', error)
            tg.showAlert('❌ Ошибка удаления адреса')
          }
        }
      })
    } else {
      if (confirm('Удалить этот адрес?')) {
        try {
          await api.deleteSavedAddress(addressId)
          loadData()
        } catch (error) {
          console.error('Ошибка удаления адреса:', error)
        }
      }
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm({
      name: address.name,
      delivery_type: address.delivery_type,
      address: address.address || '',
      city: address.city || '',
      europost_office: address.europost_office || '',
      is_default: address.is_default
    })
    setShowAddressForm(true)
  }

  const getStatusText = (status) => {
    const statuses = {
      pending: '⏳ Ожидает подтверждения',
      confirmed: '✅ Подтвержден',
      completed: '📦 Доставлен',
      cancelled: '❌ Отменен'
    }
    return statuses[status] || status
  }

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Профиль</h1>
        <div style={{
          background: 'var(--secondary-bg-color)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{ height: '24px', background: 'var(--bg-color)', borderRadius: '4px', marginBottom: '8px', width: '60%' }} />
          <div style={{ height: '16px', background: 'var(--bg-color)', borderRadius: '4px', width: '40%' }} />
        </div>
        
        <h2 className="section-title">Мои заказы</h2>
        {[1, 2, 3].map(i => (
          <SkeletonLoader key={i} type="order" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Профиль</h1>
      
      {user && (
        <div style={{
          background: 'var(--secondary-bg-color)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            {user.first_name} {user.last_name}
          </div>
          {user.username && (
            <div style={{ color: 'var(--hint-color)' }}>
              @{user.username}
            </div>
          )}
        </div>
      )}

      {/* Мои адреса */}
      <h2 className="section-title">Мои адреса</h2>
      
      {!showAddressForm && (
        <button
          onClick={() => setShowAddressForm(true)}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          ➕ Добавить адрес
        </button>
      )}

      {showAddressForm && (
        <div style={{
          background: 'var(--secondary-bg-color)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingAddress ? 'Редактировать адрес' : 'Новый адрес'}
          </h3>

          <input
            type="text"
            placeholder="Название (Дом, Работа, Дача)"
            value={addressForm.name}
            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
            className="form-input"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <button
              onClick={() => setAddressForm({ ...addressForm, delivery_type: 'minsk' })}
              className={`delivery-type-btn ${addressForm.delivery_type === 'minsk' ? 'active' : ''}`}
            >
              <span className="btn-icon">🚚</span>
              <span className="btn-text">Минск</span>
            </button>
            <button
              onClick={() => setAddressForm({ ...addressForm, delivery_type: 'europost' })}
              className={`delivery-type-btn ${addressForm.delivery_type === 'europost' ? 'active' : ''}`}
            >
              <span className="btn-icon">📦</span>
              <span className="btn-text">Евро почта</span>
            </button>
          </div>

          {addressForm.delivery_type === 'minsk' ? (
            <input
              type="text"
              placeholder="Адрес доставки"
              value={addressForm.address}
              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
              className="form-input"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Город"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Отделение Евро почты"
                value={addressForm.europost_office}
                onChange={(e) => setAddressForm({ ...addressForm, europost_office: e.target.value })}
                className="form-input"
              />
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={addressForm.is_default}
              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Использовать по умолчанию</span>
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSaveAddress}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              💾 Сохранить
            </button>
            <button
              onClick={() => {
                setShowAddressForm(false)
                setEditingAddress(null)
                setAddressForm({
                  name: '',
                  delivery_type: 'minsk',
                  address: '',
                  city: '',
                  europost_office: '',
                  is_default: false
                })
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--secondary-bg-color)',
                color: 'var(--text-color)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {savedAddresses.length === 0 && !showAddressForm ? (
        <div style={{
          background: 'var(--secondary-bg-color)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--hint-color)',
          marginBottom: '20px'
        }}>
          У вас пока нет сохраненных адресов
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          {savedAddresses.map(address => (
            <div
              key={address.id}
              style={{
                background: 'var(--secondary-bg-color)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '12px',
                border: address.is_default ? '2px solid var(--button-color)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {address.name}
                    {address.is_default && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'var(--button-color)',
                        color: 'white'
                      }}>
                        По умолчанию
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    {address.delivery_type === 'minsk' ? '🚚 Минск' : '📦 Евро почта'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditAddress(address)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--button-color)',
                      color: 'white',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ff3b30',
                      color: 'white',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                {address.delivery_type === 'minsk' ? (
                  <div>{address.address}</div>
                ) : (
                  <div>{address.city}, отделение {address.europost_office}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Мои заказы</h2>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>У вас пока нет заказов</p>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'var(--secondary-bg-color)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: '600' }}>Заказ №{order.id}</span>
                <span style={{ color: 'var(--button-color)', fontWeight: '700' }}>
                  {order.total_amount} BYN
                </span>
              </div>
              
              <div style={{ fontSize: '14px', color: 'var(--hint-color)', marginBottom: '8px' }}>
                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              <div style={{ fontSize: '14px' }}>
                {getStatusText(order.status)}
              </div>
              
              {/* Информация о доставке */}
              {order.delivery_type && (
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {order.delivery_type === 'minsk' ? '🚚 Доставка по Минску' : '📦 Евро почта'}
                  </div>
                  <div style={{ color: 'var(--hint-color)' }}>
                    {order.full_name && <div>ФИО: {order.full_name}</div>}
                    {order.phone && <div>Телефон: {order.phone}</div>}
                    {order.delivery_type === 'minsk' && order.delivery_address && (
                      <>
                        <div>Адрес: {order.delivery_address}</div>
                        {order.delivery_time && <div>Время: {order.delivery_time}</div>}
                        {order.delivery_date && <div>Дата: {order.delivery_date}</div>}
                      </>
                    )}
                    {order.delivery_type === 'europost' && (
                      <>
                        {order.city && <div>Город: {order.city}</div>}
                        {order.europost_office && <div>Отделение: {order.europost_office}</div>}
                      </>
                    )}
                    {order.payment_method && (
                      <div>Оплата: {order.payment_method === 'cash' ? '💵 Наличные' : '💎 USDT'}</div>
                    )}
                  </div>
                </div>
              )}
              
              {order.items && order.items.length > 0 && (
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Товары:</div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ color: 'var(--hint-color)' }}>
                      • {item.product.name} × {item.quantity}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Кнопка повторить заказ */}
              <button
                onClick={() => handleReorder(order)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--button-color)',
                  background: 'transparent',
                  color: 'var(--button-color)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🔄 Повторить заказ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfilePage
