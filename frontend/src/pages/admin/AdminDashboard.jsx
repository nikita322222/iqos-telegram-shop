import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'

const AdminDashboard = ({ tg }) => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await api.getAdminDashboard()
      setStats(response.data)
    } catch (error) {
      console.error('Ошибка загрузки dashboard:', error)
      if (error.response?.status === 403) {
        setError('У вас нет прав администратора')
        if (tg) {
          tg.showAlert('❌ У вас нет прав администратора')
        }
        setTimeout(() => navigate('/'), 2000)
      } else {
        setError('Ошибка загрузки данных')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h1 className="page-title">📊 Админ панель</h1>
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h1 className="page-title">📊 Админ панель</h1>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--hint-color)' 
        }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">📊 Админ панель</h1>

      {/* Статистика за сегодня */}
      <div className="stats-section">
        <h2 className="section-title">Сегодня</h2>
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
      </div>

      {/* Статистика за неделю */}
      <div className="stats-section">
        <h2 className="section-title">За неделю</h2>
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
      </div>

      {/* Статистика за месяц */}
      <div className="stats-section">
        <h2 className="section-title">За месяц</h2>
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
      </div>

      {/* Дополнительная статистика */}
      <div className="stats-section">
        <h2 className="section-title">Общее</h2>
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pending_orders}</div>
            <div className="stat-label">Ожидают подтверждения</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.new_users_week}</div>
            <div className="stat-label">Новых пользователей</div>
          </div>
        </div>
      </div>

      {/* Кнопка перехода к заказам */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '20px' }}
      >
        📋 Перейти к заказам
      </button>
    </div>
  )
}

export default AdminDashboard
