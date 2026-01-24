import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [searchQuery])

  const loadCustomers = async () => {
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      
      const response = await api.getCustomers(params)
      setCustomers(response.data)
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLoyaltyBadge = (level) => {
    const badges = {
      bronze: { icon: '🥉', color: '#CD7F32', text: 'Bronze' },
      silver: { icon: '🥈', color: '#C0C0C0', text: 'Silver' },
      gold: { icon: '🥇', color: '#FFD700', text: 'Gold' }
    }
    return badges[level] || badges.bronze
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div>
      <h1 className="page-title">👥 Клиенты</h1>

      {/* Поиск */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Поиск по имени или username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
        />
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>Клиентов не найдено</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {customers.map(customer => {
            const badge = getLoyaltyBadge(customer.loyalty_level)
            
            return (
              <div key={customer.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                      {customer.first_name} {customer.last_name}
                    </h3>
                    
                    {customer.username && (
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <a 
                          href={`https://t.me/${customer.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                        >
                          @{customer.username}
                        </a>
                      </div>
                    )}
                    
                    <div style={{ fontSize: '14px', color: 'var(--hint-color)', marginBottom: '8px' }}>
                      Telegram ID: {customer.telegram_id}
                    </div>

                    {/* Уровень лояльности */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: badge.color + '20',
                      color: badge.color,
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {badge.icon} {badge.text}
                    </div>

                    {/* Статистика */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '12px',
                      marginTop: '12px',
                      padding: '12px',
                      background: 'var(--bg-color)',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>
                          {customer.total_orders_count}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--hint-color)' }}>
                          Заказов
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#34C759' }}>
                          {customer.bonus_balance.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--hint-color)' }}>
                          Бонусов
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: customer.is_active ? '#34C759' : '#FF3B30' }}>
                          {customer.is_active ? '✓' : '✗'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--hint-color)' }}>
                          {customer.is_active ? 'Активен' : 'Неактивен'}
                        </div>
                      </div>
                    </div>

                    {/* Дата регистрации */}
                    <div style={{ fontSize: '12px', color: 'var(--hint-color)', marginTop: '8px' }}>
                      Регистрация: {new Date(customer.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Customers
