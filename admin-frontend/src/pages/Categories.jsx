import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData)
      } else {
        await api.createCategory(formData)
      }
      
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      loadCategories()
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      alert('Ошибка сохранения категории')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
      sort_order: category.sort_order
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить категорию? Товары останутся без категории.')) return
    
    try {
      await api.deleteCategory(id)
      loadCategories()
    } catch (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления категории')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      sort_order: 0
    })
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">🏷️ Категории</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingCategory(null)
            resetForm()
            setShowModal(true)
          }}
        >
          ➕ Добавить категорию
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <p>Категорий нет</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {categories.map(category => (
            <div key={category.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    {category.name}
                    {!category.is_active && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: 'var(--danger-color)', 
                        color: 'white' 
                      }}>
                        Неактивна
                      </span>
                    )}
                  </h3>
                  {category.description && (
                    <p style={{ color: 'var(--hint-color)', fontSize: '14px', marginBottom: '8px' }}>
                      {category.description}
                    </p>
                  )}
                  <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                    Порядок: {category.sort_order}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEdit(category)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(category.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Название *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Порядок отображения</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Активна</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  💾 Сохранить
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
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

export default Categories
