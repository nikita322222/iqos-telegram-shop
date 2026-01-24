import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await api.getDashboard()
      setStats(response.data)
    } catch (error) {
      console.error('Ошибка загрузки dashboard:', error)
      setError(error.response?.data?.detail || 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Загрузка...</div>
  if (error) return <div className="empty-state">{error}</div>

  return (
    <div>
      <h1 className="page-title">📊 Dashboard</h1>

      {/* Сегодня */}
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Сегодня</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.today.orders_count}</div>
          <div className="stat-label">Заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.today.revenue.toFixed(2)} BYN</div>
          <div className="stat-label">Выручка</div>
        </div>
      </div>

      {/* За неделю */}
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>За неделю</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.week.orders_count}</div>
          <div className="stat-label">Заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.week.revenue.toFixed(2)} BYN</div>
          <div className="stat-label">Выручка</div>
        </div>
      </div>

      {/* За месяц */}
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>За месяц</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.month.orders_count}</div>
          <div className="stat-label">Заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.month.revenue.toFixed(2)} BYN</div>
          <div className="stat-label">Выручка</div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Общее</h2>
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)', color: 'white' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pending_orders}</div>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Ожидают подтверждения</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.new_users_week}</div>
          <div className="stat-label">Новых пользователей</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
