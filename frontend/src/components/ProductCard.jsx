import { useCart } from '../context/CartContext'

const ProductCard = ({ product, onFavoriteToggle, isFavorite }) => {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
    }
  }

  const getBadgeClass = (badge) => {
    if (!badge) return ''
    if (badge === 'ХИТ') return 'badge-hit'
    if (badge === 'NEW') return 'badge-new'
    if (badge === 'СКИДКА') return 'badge-sale'
    return ''
  }

  return (
    <div className="product-card">
      {product.badge && (
        <div className={`product-badge ${getBadgeClass(product.badge)}`}>
          {product.badge}
        </div>
      )}
      
      <img
        src={product.image_url || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="product-image"
      />
      
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">{product.price} ₽</div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{ flex: 1, padding: '8px' }}
          >
            В корзину
          </button>
          
          {onFavoriteToggle && (
            <button
              onClick={() => onFavoriteToggle(product.id)}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '8px',
                background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
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
