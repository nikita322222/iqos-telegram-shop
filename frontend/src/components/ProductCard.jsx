import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product, onFavoriteToggle, isFavorite }) => {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    setIsAdding(true)
    
    try {
      addToCart(product)
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      // Небольшая задержка для визуального эффекта
      await new Promise(resolve => setTimeout(resolve, 300))
    } finally {
      setIsAdding(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <img
        src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300?text=No+Image'
        }}
      />
      
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">{product.price} BYN</div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="btn btn-primary"
            style={{ 
              flex: 1, 
              padding: '8px',
              opacity: isAdding || product.stock === 0 ? 0.6 : 1
            }}
          >
            {isAdding ? '⏳' : product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
          </button>
          
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavoriteToggle(product.id)
              }}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '8px',
                background: 'var(--secondary-bg-color)',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
