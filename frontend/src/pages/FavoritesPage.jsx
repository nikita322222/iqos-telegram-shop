import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

const FavoritesPage = ({ tg }) => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const response = await api.getFavorites()
      setFavorites(response.data)
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (productId) => {
    try {
      await api.removeFromFavorites(productId)
      setFavorites(prev => prev.filter(f => f.product_id !== productId))
      
      if (tg) {
        tg.HapticFeedback.impactOccurred('light')
      }
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="page-title">Избранное</h1>
      
      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <p>Нет избранных товаров</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Добавьте товары в избранное, чтобы быстро их находить
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map(favorite => (
            <ProductCard
              key={favorite.product.id}
              product={favorite.product}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
