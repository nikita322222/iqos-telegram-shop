import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

const CatalogPage = ({ tg }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    loadData()
  }, [selectedCategory])

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

  const categories = ['Устройства', 'Стики', 'Аксессуары']

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="page-title">Каталог</h1>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          className="btn"
          style={{
            background: !selectedCategory ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
            color: !selectedCategory ? 'white' : 'var(--tg-theme-text-color)',
            padding: '8px 16px',
            whiteSpace: 'nowrap'
          }}
        >
          Все
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className="btn"
            style={{
              background: selectedCategory === category ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
              color: selectedCategory === category ? 'white' : 'var(--tg-theme-text-color)',
              padding: '8px 16px',
              whiteSpace: 'nowrap'
            }}
          >
            {category}
          </button>
        ))}
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
