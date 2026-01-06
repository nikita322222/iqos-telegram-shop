import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

const HomePage = ({ tg }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, favoritesRes] = await Promise.all([
        api.getProducts({ limit: 20 }),
        api.getFavorites().catch(() => ({ data: [] }))
      ])
      
      setProducts(productsRes.data)
      setFavorites(new Set(favoritesRes.data.map(f => f.product_id)))
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      if (tg) {
        tg.showAlert('Ошибка загрузки данных')
      }
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
      console.error('Ошибка работы с избранным:', error)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  const hitProducts = products.filter(p => p.badge === 'ХИТ')
  const newProducts = products.filter(p => p.badge === 'NEW')
  const saleProducts = products.filter(p => p.badge === 'СКИДКА')

  return (
    <div>
      <h1 className="page-title">IQOS Shop</h1>
      <p style={{ color: 'var(--tg-theme-hint-color, #999)', marginBottom: '20px' }}>
        Добро пожаловать в наш магазин!
      </p>

      {hitProducts.length > 0 && (
        <>
          <h2 className="section-title">🔥 Хиты продаж</h2>
          <div className="product-grid">
            {hitProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        </>
      )}

      {newProducts.length > 0 && (
        <>
          <h2 className="section-title">✨ Новинки</h2>
          <div className="product-grid">
            {newProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        </>
      )}

      {saleProducts.length > 0 && (
        <>
          <h2 className="section-title">🏷️ Скидки</h2>
          <div className="product-grid">
            {saleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">📦 Все товары</h2>
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
    </div>
  )
}

export default HomePage
