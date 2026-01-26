import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [sending, setSending] = useState(false)
  
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    send_immediately: true,
    scheduled_time: '',
    repeat_enabled: false,
    repeat_interval_hours: 24,
    max_repeats: null
  })

  useEffect(() => {
    loadData()
  }, [searchQuery])

  const loadData = async () => {
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      
      const [customersRes, broadcastsRes] = await Promise.all([
        api.getCustomers(params),
        api.getBroadcasts()
      ])
      
      setCustomers(customersRes.data)
      setBroadcasts(broadcastsRes.data)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    
    if (!broadcastForm.message.trim()) {
      alert('Введите текст сообщения')
      return
    }
    
    if (!confirm(`Отправить рассылку ${customers.length} клиентам?`)) return
    
    setSending(true)
    try {
      const data = {
        ...broadcastForm,
        scheduled_time: broadcastForm.scheduled_time || null,
        max_repeats: broadcastForm.max_repeats || null
      }
      
      await api.createBroadcast(data)
      
      alert('✅ Рассылка создана!')
      setShowBroadcastModal(false)
      resetBroadcastForm()
      loadData()
    } catch (error) {
      console.error('Ошибка отправки рассылки:', error)
      alert('❌ Ошибка отправки рассылки')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteBroadcast = async (id) => {
    if (!confirm('Удалить рассылку?')) return
    
    try {
      await api.deleteBroadcast(id)
      loadData()
    } catch (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления рассылки')
    }
  }

  const handleSendNow = async (id) => {
    if (!confirm('Отправить рассылку сейчас?')) return
    
    try {
      await api.sendBroadcast(id)
      alert('✅ Рассылка отправлена!')
      loadData()
    } catch (error) {
      console.error('Ошибка отправки:', error)
      alert('❌ Ошибка отправки')
    }
  }

  const resetBroadcastForm = () => {
    setBroadcastForm({
      message: '',
      send_immediately: true,
      scheduled_time: '',
      repeat_enabled: false,
      repeat_interval_hours: 24,
      max_repeats: null
    })
  }

  const getStatusText = (status) => {
    const statuses = {
      draft: '📝 Черновик',
      scheduled: '⏰ Запланирована',
      sending: '📤 Отправляется',
      completed: '✅ Отправлена',
      failed: '❌ Ошибка'
    }
    return statuses[status] || status
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">👥 Клиенты</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowBroadcastModal(true)}
        >
          📢 Создать рассылку
        </button>
      </div>

      {/* Поиск */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Поиск клиента..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
        />
      </div>

      {/* Статистика */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Всего клиентов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{broadcasts.length}</div>
          <div className="stat-label">Рассылок</div>
        </div>
      </div>

      {/* История рассылок */}
      {broadcasts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>📊 История рассылок</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {broadcasts.map(broadcast => (
              <div key={broadcast.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600' }}>{getStatusText(broadcast.status)}</div>
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    {new Date(broadcast.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'var(--bg-color)', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  {broadcast.message}
                </div>
                
                <div style={{ fontSize: '14px', color: 'var(--hint-color)', marginBottom: '12px' }}>
                  <div>📊 Отправлено: {broadcast.sent_count} / {broadcast.total_recipients}</div>
                  {broadcast.failed_count > 0 && (
                    <div style={{ color: '#FF3B30' }}>❌ Ошибок: {broadcast.failed_count}</div>
                  )}
                  {broadcast.repeat_enabled && (
                    <div>🔄 Повторение: каждые {broadcast.repeat_interval_hours}ч (повторено {broadcast.repeat_count} раз)</div>
                  )}
                  {broadcast.scheduled_time && (
                    <div>⏰ Запланировано: {new Date(broadcast.scheduled_time).toLocaleString('ru-RU')}</div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {broadcast.status === 'scheduled' && (
                    <button
                      onClick={() => handleSendNow(broadcast.id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      📤 Отправить сейчас
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBroadcast(broadcast.id)}
                    className="btn btn-danger"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список клиентов */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Список клиентов</h2>
      {customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>Клиентов не найдено</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {customers.map(customer => (
            <div key={customer.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {customer.first_name} {customer.last_name}
                  </h3>
                  {customer.username && (
                    <div style={{ fontSize: '14px', color: 'var(--primary-color)', marginBottom: '4px' }}>
                      <a 
                        href={`https://t.me/${customer.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        @{customer.username}
                      </a>
                    </div>
                  )}
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    ID: {customer.telegram_id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-color)' }}>
                    {customer.bonus_balance.toFixed(2)} BYN
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hint-color)' }}>
                    Бонусы
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--hint-color)' }}>Заказов:</span> {customer.total_orders_count}
                </div>
                <div>
                  <span style={{ color: 'var(--hint-color)' }}>Уровень:</span> {customer.loyalty_level}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания рассылки */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📢 Новая рассылка</h2>
              <button className="modal-close" onClick={() => setShowBroadcastModal(false)}>×</button>
            </div>

            <form onSubmit={handleSendBroadcast}>
              <div className="form-group">
                <label className="form-label">Текст сообщения *</label>
                <textarea
                  className="form-textarea"
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Введите текст сообщения (поддерживается HTML)"
                  rows="6"
                  required
                />
                <div style={{ fontSize: '12px', color: 'var(--hint-color)', marginTop: '4px' }}>
                  Поддерживается HTML: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;, &lt;a href="..."&gt;ссылка&lt;/a&gt;
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={broadcastForm.send_immediately}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, send_immediately: e.target.checked })}
                  />
                  <span>Отправить немедленно</span>
                </label>
              </div>

              {!broadcastForm.send_immediately && (
                <div className="form-group">
                  <label className="form-label">Запланировать на время</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={broadcastForm.scheduled_time}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, scheduled_time: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={broadcastForm.repeat_enabled}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, repeat_enabled: e.target.checked })}
                  />
                  <span>Включить повторение</span>
                </label>
              </div>

              {broadcastForm.repeat_enabled && (
                <>
                  <div className="form-group">
                    <label className="form-label">Интервал повторения (часов)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={broadcastForm.repeat_interval_hours}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, repeat_interval_hours: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Максимум повторений (оставьте пустым для бесконечного)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={broadcastForm.max_repeats || ''}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, max_repeats: e.target.value ? parseInt(e.target.value) : null })}
                      min="1"
                      placeholder="Без ограничений"
                    />
                  </div>
                </>
              )}

              <div style={{ 
                background: 'var(--bg-color)', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                📊 Рассылка будет отправлена <b>{customers.length}</b> клиентам
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={sending}
                >
                  {sending ? '⏳ Отправка...' : '📤 Отправить'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBroadcastModal(false)}
                  disabled={sending}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
