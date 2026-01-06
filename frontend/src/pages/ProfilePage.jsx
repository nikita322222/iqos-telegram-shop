import { useState, useEffect } from 'react'
import { api } from '../api/client'

const ProfilePage = ({ tg }) => {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getOrders().catch(() => ({ data: [] }))
      ])
      
      if (userRes) setUser(userRes.data)
      setOrders(ordersRes.data)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
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
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="page-title">Профиль</h1>
      
      {user && (
        <div style={{
          background: 'var(--tg-theme-secondary-bg-color)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            {user.first_name} {user.last_name}
          </div>
          {user.username && (
            <div style={{ color: 'var(--tg-theme-hint-color)' }}>
              @{user.username}
            </div>
          )}
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
                background: 'var(--tg-theme-secondary-bg-color)',
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
                <span style={{ color: 'var(--tg-theme-button-color)', fontWeight: '700' }}>
                  {order.total_amount} BYN
                </span>
              </div>
              
              <div style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', marginBottom: '8px' }}>
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
                  <div style={{ color: 'var(--tg-theme-hint-color)' }}>
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
                    <div key={idx} style={{ color: 'var(--tg-theme-hint-color)' }}>
                      • {item.product.name} × {item.quantity}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfilePage
