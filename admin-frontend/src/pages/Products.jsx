import { useState, useEffect } from 'react'
import { api } from '../api/client'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    badge: '',
    stock: 999,
    image_url: '',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [searchQuery, categoryFilter])

  const loadData = async () => {
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (categoryFilter) params.category = categoryFilter
      
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts(params),
        api.getCategories()
      ])
      
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await api.uploadImage(file)
      setFormData({ ...formData, image_url: response.data.image_url })
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData)
      } else {
        await api.createProduct(formData)
      }
      
      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      alert('Ошибка сохранения товара')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      badge: product.badge || '',
      stock: product.stock,
      image_url: product.image_url || '',
      is_active: product.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return
    
    try {
      await api.deleteProduct(id)
      loadData()
    } catch (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления товара')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      badge: '',
      stock: 999,
      image_url: '',
      is_active: true
    })
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">📦 Товары</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null)
            resetForm()
            setShowModal(true)
          }}
        >
          ➕ Добавить товар
        </button>
      </div>

      {/* Фильтры */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Поиск товара..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-select"
          style={{ width: '200px' }}
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Список товаров */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>Товаров не найдено</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {products.map(product => (
            <div key={product.id} className="card">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                />
              )}
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
              <div style={{ fontSize: '14px', color: 'var(--hint-color)', marginBottom: '8px' }}>
                {product.category}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '12px' }}>
                {product.price} BYN
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => handleEdit(product)}
                >
                  ✏️ Изменить
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(product.id)}
                >
                  🗑️
                </button>
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
                {editingProduct ? 'Редактировать товар' : 'Новый товар'}
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
                <label className="form-label">Цена (BYN) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Категория</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Бейдж</label>
                <select
                  className="form-select"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                >
                  <option value="">Без бейджа</option>
                  <option value="NEW">NEW</option>
                  <option value="ХИТ">ХИТ</option>
                  <option value="СКИДКА">СКИДКА</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Изображение</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ marginBottom: '12px' }}
                />
                {uploading && <div>Загрузка...</div>}
                {formData.image_url && (
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Активен</span>
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

export default Products
