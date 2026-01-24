import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [statusFilter, searchQuery])

  const loadOrders = async () => {
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      
      const response = await api.getOrders(params)
      setOrders(response.data)
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`${newStatus === 'confirmed' ? 'Подтвердить' : 'Отменить'} заказ?`)) return
    
    try {
      await api.updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      alert('Ошибка обновления статуса')
    }
  }

  const getStatusText = (status) => {
    const statuses = {
      pending: '⏳ Ожидает',
      confirmed: '✅ Подтвержден',
      completed: '📦 Доставлен',
      cancelled: '❌ Отменен'
    }
    return statuses[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9500',
      confirmed: '#34C759',
      completed: '#007AFF',
      cancelled: '#FF3B30'
    }
    return colors[status] || '#8E8E93'
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div>
      <h1 className="page-title">📋 Заказы</h1>

      {/* Фильтры */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Поиск по номеру, имени, телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: '200px' }}
        >
          <option value="">Все статусы</option>
          <option value="pending">⏳ Ожидают</option>
          <option value="confirmed">✅ Подтверждены</option>
          <option value="completed">📦 Доставлены</option>
          <option value="cancelled">❌ Отменены</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>Заказов не найдено</p>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div 
              key={order.id} 
              className="card"
              style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}
            >
              {/* Заголовок */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Заказ №{order.id}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    {new Date(order.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>
                  {order.total_amount} BYN
                </div>
              </div>

              {/* Статус */}
              <div style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '8px',
                background: getStatusColor(order.status) + '20',
                color: getStatusColor(order.status),
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                {getStatusText(order.status)}
              </div>

              {/* Клиент */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600' }}>👤 {order.full_name}</div>
                <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                  📞 {order.phone}
                </div>
                {order.user?.username && (
                  <div style={{ fontSize: '14px' }}>
                    <a 
                      href={`https://t.me/${order.user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                    >
                      @{order.user.username}
                    </a>
                  </div>
                )}
              </div>

              {/* Доставка */}
              <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {order.delivery_type === 'minsk' ? '🚚 Доставка по Минску' : '📦 Евро почта'}
                </div>
                {order.delivery_type === 'minsk' ? (
                  <>
                    <div>{order.delivery_address}</div>
                    <div>Время: {order.delivery_time}</div>
                    {order.delivery_date && <div>Дата: {order.delivery_date}</div>}
                  </>
                ) : (
                  <div>{order.city}, отделение {order.europost_office}</div>
                )}
                <div style={{ marginTop: '4px' }}>
                  Оплата: {order.payment_method === 'cash' ? '💵 Наличные' : '💎 USDT'}
                </div>
              </div>

              {/* Кнопка показать товары */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '12px' }}
              >
                {expandedOrder === order.id ? '▲ Скрыть товары' : '▼ Показать товары'}
              </button>

              {/* Товары */}
              {expandedOrder === order.id && order.items && (
                <div style={{
                  background: 'var(--bg-color)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>Товары:</div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '4px' }}>
                      • {item.product.name} × {item.quantity} = {(item.price * item.quantity).toFixed(2)} BYN
                    </div>
                  ))}
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <div>Товары: {(order.total_amount - order.delivery_cost + order.bonus_used).toFixed(2)} BYN</div>
                    <div>Доставка: {order.delivery_cost} BYN</div>
                    {order.bonus_used > 0 && (
                      <div style={{ color: '#34C759' }}>Бонусы: -{order.bonus_used} BYN</div>
                    )}
                    <div style={{ fontWeight: '600', marginTop: '4px' }}>
                      Итого: {order.total_amount} BYN
                    </div>
                  </div>
                </div>
              )}

              {/* Комментарий */}
              {order.comment && (
                <div style={{
                  background: 'var(--bg-color)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>💬 Комментарий:</div>
                  {order.comment}
                </div>
              )}

              {/* Кнопки действий */}
              {order.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleStatusChange(order.id, 'confirmed')}
                    className="btn btn-success"
                    style={{ flex: 1 }}
                  >
                    ✅ Подтвердить
                  </button>
                  <button
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    ❌ Отменить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
