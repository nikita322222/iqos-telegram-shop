import { useState, useEffect } from 'react'
import { api } from '../../api/client'

const AdminOrders = ({ tg }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [statusFilter, deliveryFilter, searchQuery])

  const loadOrders = async () => {
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (deliveryFilter) params.delivery_type = deliveryFilter
      if (searchQuery) params.search = searchQuery

      const response = await api.getAdminOrders(params)
      setOrders(response.data)
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
      if (tg) {
        tg.showAlert('❌ Ошибка загрузки заказов')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    const confirmMessage = newStatus === 'confirmed' 
      ? 'Подтвердить заказ?' 
      : 'Отменить заказ?'

    const confirm = tg 
      ? await new Promise(resolve => tg.showConfirm(confirmMessage, resolve))
      : window.confirm(confirmMessage)

    if (!confirm) return

    try {
      await api.updateOrderStatus(orderId, newStatus)
      
      if (tg) {
        tg.showAlert(newStatus === 'confirmed' ? '✅ Заказ подтвержден' : '❌ Заказ отменен')
        tg.HapticFeedback.notificationOccurred('success')
      }
      
      loadOrders()
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      if (tg) {
        tg.showAlert('❌ Ошибка обновления статуса')
      }
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

  if (loading) {
    return (
      <div>
        <h1 className="page-title">📋 Управление заказами</h1>
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="admin-orders">
      <h1 className="page-title">📋 Управление заказами</h1>

      {/* Фильтры */}
      <div className="filters-section">
        {/* Поиск */}
        <input
          type="text"
          placeholder="🔍 Поиск по номеру, имени, телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ marginBottom: '12px' }}
        />

        {/* Фильтр по статусу */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ marginBottom: '12px' }}
        >
          <option value="">Все статусы</option>
          <option value="pending">⏳ Ожидают</option>
          <option value="confirmed">✅ Подтверждены</option>
          <option value="completed">📦 Доставлены</option>
          <option value="cancelled">❌ Отменены</option>
        </select>

        {/* Фильтр по типу доставки */}
        <select
          value={deliveryFilter}
          onChange={(e) => setDeliveryFilter(e.target.value)}
          className="form-input"
        >
          <option value="">Все типы доставки</option>
          <option value="minsk">🚚 Минск</option>
          <option value="europost">📦 Евро почта</option>
        </select>
      </div>

      {/* Список заказов */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>Заказов не найдено</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div
              key={order.id}
              className="order-card-admin"
              style={{
                background: 'var(--secondary-bg-color)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '12px',
                borderLeft: `4px solid ${getStatusColor(order.status)}`
              }}
            >
              {/* Заголовок заказа */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>
                    Заказ №{order.id}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    {new Date(order.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--button-color)'
                }}>
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

              {/* Информация о клиенте */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  👤 {order.full_name}
                </div>
                <a
                  href={`tel:${order.phone}`}
                  style={{
                    color: 'var(--button-color)',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  📞 {order.phone}
                </a>
                {order.user?.username && (
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    <a
                      href={`https://t.me/${order.user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--button-color)', textDecoration: 'none' }}
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
                  <>
                    <div>{order.city}, отделение {order.europost_office}</div>
                  </>
                )}
                <div style={{ marginTop: '4px' }}>
                  Оплата: {order.payment_method === 'cash' ? '💵 Наличные' : '💎 USDT'}
                </div>
              </div>

              {/* Кнопка развернуть/свернуть */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {expandedOrder === order.id ? '▲ Скрыть товары' : '▼ Показать товары'}
              </button>

              {/* Товары (раскрывающийся список) */}
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
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#34C759',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Подтвердить
                  </button>
                  <button
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#FF3B30',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
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

export default AdminOrders
