import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

const CatalogPage = ({ tg }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategories, setShowCategories] = useState(true)

  const categories = [
    { name: 'Устройства', icon: '📱', color: '#3390ec' },
    { name: 'Стики', icon: '🚬', color: '#34c759' },
    { name: 'Аксессуары', icon: '🎒', color: '#ff9500' }
  ]

  useEffect(() => {
    if (!showCategories) {
      loadData()
    }
  }, [selectedCategory, showCategories])

  const loadData = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {}
      const [productsRes, favoritesRes] = await Promise.all([
        api.getProducts(params),
        api.getFavorites().catch(() => ({ data: [] }))
      ])
      
      setProducts(productsRes.data)
      setFavorites(new Set(favoritesRes.data.map(f => f.product_id)))
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (productId) => {
    try {
      if (favorites.has(productId)) {
        await api.removeFromFavorites(productId)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      } else {
        await api.addToFavorites(productId)
        setFavorites(prev => new Set([...prev, productId]))
      }
      
      if (tg) {
        tg.HapticFeedback.impactOccurred('light')
      }
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName)
    setShowCategories(false)
    setLoading(true)
  }

  const handleBackToCategories = () => {
    setShowCategories(true)
    setSelectedCategory(null)
    setProducts([])
  }

  if (showCategories) {
    return (
      <div>
        <h1 className="page-title">Каталог</h1>
        <p style={{ color: 'var(--tg-theme-hint-color, #999)', marginBottom: '20px' }}>
          Выберите категорию товаров
        </p>

        <div style={{ display: 'grid', gap: '16px' }}>
          {categories.map(category => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              style={{
                background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s',
                border: `2px solid ${category.color}20`
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                fontSize: '48px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${category.color}20`,
                borderRadius: '12px'
              }}>
                {category.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {category.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color, #999)' }}>
                  Посмотреть товары →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={handleBackToCategories}
          style={{
            background: 'var(--tg-theme-secondary-bg-color)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>{selectedCategory}</h1>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={favorites.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CatalogPage
