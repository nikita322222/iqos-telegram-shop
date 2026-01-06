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
    { name: 'Terea kz', image: 'https://via.placeholder.com/150?text=Terea+KZ' },
    { name: 'Парламент ru', image: 'https://via.placeholder.com/150?text=Parliament+RU' },
    { name: 'Heets kz', image: 'https://via.placeholder.com/150?text=Heets+KZ' },
    { name: 'FiiT ru/kz', image: 'https://via.placeholder.com/150?text=FiiT' },
    { name: 'Terea arm', image: 'https://via.placeholder.com/150?text=Terea+ARM' },
    { name: 'Terea eu/ind', image: 'https://via.placeholder.com/150?text=Terea+EU' },
    { name: 'IQOS LIL SOLID DUAL', image: 'https://via.placeholder.com/150?text=LIL+SOLID' },
    { name: 'Iqos duos original', image: 'https://via.placeholder.com/150?text=Duos' },
    { name: 'Iqos Original One', image: 'https://via.placeholder.com/150?text=Original+One' },
    { name: 'Iqos iluma one', image: 'https://via.placeholder.com/150?text=Iluma+One' },
    { name: 'Iqos iluma', image: 'https://via.placeholder.com/150?text=Iluma' },
    { name: 'Iqos iluma prime', image: 'https://via.placeholder.com/150?text=Iluma+Prime' },
    { name: 'Iqos iluma i series prime', image: 'https://via.placeholder.com/150?text=i+Series' },
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

        <div className="product-grid">
          {categories.map(category => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="product-card"
              style={{ cursor: 'pointer' }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="product-image"
              />
              
              <div className="product-info">
                <div className="product-name" style={{ 
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  fontSize: '13px',
                  lineHeight: '1.3',
                  minHeight: '34px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {category.name}
                </div>
                
                <button
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '8px',
                    marginTop: '8px',
                    fontSize: '14px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCategoryClick(category.name)
                  }}
                >
                  Открыть →
                </button>
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
            padding: '12px 16px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Назад
        </button>
        <h1 className="page-title" style={{ margin: 0, fontSize: '20px' }}>{selectedCategory}</h1>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>Товары не найдены</p>
          <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--tg-theme-hint-color)' }}>
            В этой категории пока нет товаров
          </p>
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
