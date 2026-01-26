import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [addingCustomer, setAddingCustomer] = useState(false)
  
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    send_immediately: true,
    scheduled_time: '',
    repeat_enabled: false,
    repeat_interval_hours: 24,
    max_repeats: null
  })

  const [newCustomerForm, setNewCustomerForm] = useState({
    telegram_id: '',
    username: ''
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

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    
    if (!newCustomerForm.telegram_id && !newCustomerForm.username) {
      alert('Введите Telegram ID или username')
      return
    }
    
    setAddingCustomer(true)
    try {
      const data = {}
      if (newCustomerForm.telegram_id) {
        data.telegram_id = parseInt(newCustomerForm.telegram_id)
      }
      if (newCustomerForm.username) {
        data.username = newCustomerForm.username
      }
      
      await api.addCustomer(data)
      
      alert('✅ Клиент добавлен!')
      setShowAddCustomerModal(false)
      setNewCustomerForm({ telegram_id: '', username: '' })
      loadData()
    } catch (error) {
      console.error('Ошибка добавления клиента:', error)
      const errorMsg = error.response?.data?.detail || 'Ошибка добавления клиента'
      alert('❌ ' + errorMsg)
    } finally {
      setAddingCustomer(false)
    }
  }

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!confirm(`Удалить клиента ${customerName}? Пользователь потеряет доступ к магазину.`)) return
    
    try {
      await api.deleteCustomer(customerId)
      alert('✅ Клиент удален')
      loadData()
    } catch (error) {
      console.error('Ошибка удаления:', error)
      const errorMsg = error.response?.data?.detail || 'Ошибка удаления клиента'
      alert('❌ ' + errorMsg)
    }
  }

  const handleActivateCustomer = async (customerId, customerName) => {
    if (!confirm(`Активировать клиента ${customerName}?`)) return
    
    try {
      await api.activateCustomer(customerId)
      alert('✅ Клиент активирован')
      loadData()
    } catch (error) {
      console.error('Ошибка активации:', error)
      alert('❌ Ошибка активации клиента')
    }
  }

  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    
    if (!broadcastForm.message.trim()) {
      alert('Введите текст сообщения')
      return
    }
    
    const activeCustomers = customers.filter(c => c.is_active)
    if (!confirm(`Отправить рассылку ${activeCustomers.length} активным клиентам?`)) return
    
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

  const activeCustomers = customers.filter(c => c.is_active)
  const inactiveCustomers = customers.filter(c => !c.is_active)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title">👥 Клиенты</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-success"
            onClick={() => setShowAddCustomerModal(true)}
          >
            ➕ Добавить клиента
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowBroadcastModal(true)}
          >
            📢 Рассылка
          </button>
        </div>
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
          <div className="stat-value">{activeCustomers.length}</div>
          <div className="stat-label">Активных клиентов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inactiveCustomers.length}</div>
          <div className="stat-label">Заблокированных</div>
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
            {broadcasts.slice(0, 3).map(broadcast => (
              <div key={broadcast.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600' }}>{getStatusText(broadcast.status)}</div>
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    {new Date(broadcast.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'var(--secondary-bg)', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  {broadcast.message.length > 100 ? broadcast.message.substring(0, 100) + '...' : broadcast.message}
                </div>
                
                <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                  📊 Отправлено: {broadcast.sent_count} / {broadcast.total_recipients}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список клиентов */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Активные клиенты</h2>
      {activeCustomers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>Активных клиентов не найдено</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {activeCustomers.map(customer => (
            <div key={customer.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
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
                  <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: 'var(--hint-color)' }}>Заказов:</span> {customer.total_orders_count}
                    </div>
                    <div>
                      <span style={{ color: 'var(--hint-color)' }}>Бонусы:</span> {customer.bonus_balance.toFixed(2)} BYN
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCustomer(customer.id, customer.first_name || customer.username || customer.telegram_id)}
                  className="btn btn-danger"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Заблокированные клиенты */}
      {inactiveCustomers.length > 0 && (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>🚫 Заблокированные клиенты</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inactiveCustomers.map(customer => (
              <div key={customer.id} className="card" style={{ opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {customer.first_name} {customer.last_name}
                    </h3>
                    {customer.username && (
                      <div style={{ fontSize: '14px', color: 'var(--hint-color)', marginBottom: '4px' }}>
                        @{customer.username}
                      </div>
                    )}
                    <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                      ID: {customer.telegram_id}
                    </div>
                  </div>
                  <button
                    onClick={() => handleActivateCustomer(customer.id, customer.first_name || customer.username || customer.telegram_id)}
                    className="btn btn-success"
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    ✅ Активировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Модальное окно добавления клиента */}
      {showAddCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowAddCustomerModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Добавить клиента</h2>
              <button className="modal-close" onClick={() => setShowAddCustomerModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label className="form-label">Telegram ID *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newCustomerForm.telegram_id}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, telegram_id: e.target.value })}
                  placeholder="123456789"
                />
                <div style={{ fontSize: '12px', color: 'var(--hint-color)', marginTop: '4px' }}>
                  Пользователь может узнать свой ID через бота @userinfobot
                </div>
              </div>

              <div style={{ 
                background: 'var(--secondary-bg)', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                ℹ️ После добавления пользователь получит доступ к магазину
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={addingCustomer}
                >
                  {addingCustomer ? '⏳ Добавление...' : '➕ Добавить'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddCustomerModal(false)}
                  disabled={addingCustomer}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
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
                background: 'var(--secondary-bg)', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                📊 Рассылка будет отправлена <b>{activeCustomers.length}</b> активным клиентам
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
