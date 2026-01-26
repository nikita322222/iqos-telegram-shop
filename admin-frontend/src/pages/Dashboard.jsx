import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [dailyStats, setDailyStats] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, daily, monthly
  
  // Фильтры для дневной статистики
  const [dailyStartDate, setDailyStartDate] = useState('')
  const [dailyEndDate, setDailyEndDate] = useState('')
  
  // Фильтры для месячной статистики
  const [monthlyStartMonth, setMonthlyStartMonth] = useState('')
  const [monthlyEndMonth, setMonthlyEndMonth] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyStats()
    } else if (activeTab === 'monthly') {
      loadMonthlyStats()
    }
  }, [activeTab, dailyStartDate, dailyEndDate, monthlyStartMonth, monthlyEndMonth])

  const loadDashboard = async () => {
    try {
      const response = await api.getDashboard()
      setDashboard(response.data)
    } catch (error) {
      console.error('Ошибка загрузки dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDailyStats = async () => {
    try {
      const params = {}
      if (dailyStartDate) params.start_date = dailyStartDate
      if (dailyEndDate) params.end_date = dailyEndDate
      
      const response = await api.getDailyStats(params)
      setDailyStats(response.data)
    } catch (error) {
      console.error('Ошибка загрузки дневной статистики:', error)
    }
  }

  const loadMonthlyStats = async () => {
    try {
      const params = {}
      if (monthlyStartMonth) params.start_month = monthlyStartMonth
      if (monthlyEndMonth) params.end_month = monthlyEndMonth
      
      const response = await api.getMonthlyStats(params)
      setMonthlyStats(response.data)
    } catch (error) {
      console.error('Ошибка загрузки месячной статистики:', error)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div>
      <h1 className="page-title">📊 Статистика</h1>

      {/* Вкладки */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '2px solid var(--border-color)',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'overview' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'overview' ? 'white' : 'var(--text-color)',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}
        >
          📈 Обзор
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'daily' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'daily' ? 'white' : 'var(--text-color)',
            border: 'none',
            borderBottom: activeTab === 'daily' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}
        >
          📅 По дням
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'monthly' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'monthly' ? 'white' : 'var(--text-color)',
            border: 'none',
            borderBottom: activeTab === 'monthly' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}
        >
          📆 По месяцам
        </button>
      </div>

      {/* Обзор */}
      {activeTab === 'overview' && dashboard && (
        <div>
          {/* Основная статистика */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboard.today.orders_count}</div>
              <div className="stat-label">Заказов сегодня</div>
              <div className="stat-sublabel">{dashboard.today.revenue.toFixed(2)} BYN</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{dashboard.week.orders_count}</div>
              <div className="stat-label">Заказов за неделю</div>
              <div className="stat-sublabel">{dashboard.week.revenue.toFixed(2)} BYN</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{dashboard.month.orders_count}</div>
              <div className="stat-label">Заказов за месяц</div>
              <div className="stat-sublabel">{dashboard.month.revenue.toFixed(2)} BYN</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{dashboard.pending_orders}</div>
              <div className="stat-label">Ожидают обработки</div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div style={{ marginTop: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                👥 Новые клиенты за неделю
              </h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)' }}>
                {dashboard.new_users_week}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика по дням */}
      {activeTab === 'daily' && (
        <div>
          {/* Фильтры */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                С даты:
              </label>
              <input
                type="date"
                className="form-input"
                value={dailyStartDate}
                onChange={(e) => setDailyStartDate(e.target.value)}
                min="2026-01-01"
                style={{ width: '200px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                По дату:
              </label>
              <input
                type="date"
                className="form-input"
                value={dailyEndDate}
                onChange={(e) => setDailyEndDate(e.target.value)}
                min="2026-01-01"
                style={{ width: '200px' }}
              />
            </div>
            <button
              onClick={() => {
                setDailyStartDate('')
                setDailyEndDate('')
              }}
              className="btn btn-secondary"
              style={{ alignSelf: 'flex-end' }}
            >
              Сбросить
            </button>
          </div>

          {dailyStats && (
            <>
              {/* Итоги */}
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-value">{dailyStats.totals.orders_count}</div>
                  <div className="stat-label">Всего заказов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{dailyStats.totals.revenue.toFixed(2)}</div>
                  <div className="stat-label">Выручка (BYN)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{dailyStats.totals.new_customers}</div>
                  <div className="stat-label">Новых клиентов</div>
                </div>
              </div>

              {/* Таблица */}
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Дата</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Заказов</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Выручка (BYN)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Новых клиентов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.stats.map((stat, idx) => (
                      <tr 
                        key={stat.date}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          background: idx % 2 === 0 ? 'transparent' : 'var(--bg-color)'
                        }}
                      >
                        <td style={{ padding: '12px' }}>{formatDate(stat.date)}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                          {stat.orders_count}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                          {stat.revenue.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {stat.new_customers}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Статистика по месяцам */}
      {activeTab === 'monthly' && (
        <div>
          {/* Фильтры */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                С месяца:
              </label>
              <input
                type="month"
                className="form-input"
                value={monthlyStartMonth}
                onChange={(e) => setMonthlyStartMonth(e.target.value)}
                min="2026-01"
                style={{ width: '200px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                По месяц:
              </label>
              <input
                type="month"
                className="form-input"
                value={monthlyEndMonth}
                onChange={(e) => setMonthlyEndMonth(e.target.value)}
                min="2026-01"
                style={{ width: '200px' }}
              />
            </div>
            <button
              onClick={() => {
                setMonthlyStartMonth('')
                setMonthlyEndMonth('')
              }}
              className="btn btn-secondary"
              style={{ alignSelf: 'flex-end' }}
            >
              Сбросить
            </button>
          </div>

          {monthlyStats && (
            <>
              {/* Итоги */}
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-value">{monthlyStats.totals.orders_count}</div>
                  <div className="stat-label">Всего заказов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{monthlyStats.totals.revenue.toFixed(2)}</div>
                  <div className="stat-label">Выручка (BYN)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{monthlyStats.totals.new_customers}</div>
                  <div className="stat-label">Новых клиентов</div>
                </div>
              </div>

              {/* Таблица */}
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Месяц</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Заказов</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Выручка (BYN)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Новых клиентов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.stats.map((stat, idx) => (
                      <tr 
                        key={stat.month}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          background: idx % 2 === 0 ? 'transparent' : 'var(--bg-color)'
                        }}
                      >
                        <td style={{ padding: '12px' }}>{formatMonth(stat.month)}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                          {stat.orders_count}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                          {stat.revenue.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {stat.new_customers}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
