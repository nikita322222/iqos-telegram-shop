import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'

const ProductPage = ({ tg }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    loadProduct()
    checkFavorite()
  }, [id])

  const loadProduct = async () => {
    try {
      const response = await api.getProduct(id)
      setProduct(response.data)
    } catch (error) {
      console.error('Ошибка загрузки товара:', error)
      if (tg) {
        tg.showAlert('Товар не найден')
      }
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const response = await api.getFavorites()
      setIsFavorite(response.data.some(f => f.product_id === parseInt(id)))
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    if (tg) {
      tg.HapticFeedback.notificationOccurred('success')
      tg.showPopup({
        title: 'Добавлено в корзину',
        message: `${product.name} (${quantity} шт.)`,
        buttons: [
          { id: 'cart', type: 'default', text: 'Перейти в корзину' },
          { type: 'close' }
        ]
      }, (buttonId) => {
        if (buttonId === 'cart') {
          navigate('/cart')
        }
      })
    }
  }

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await api.removeFromFavorites(product.id)
        setIsFavorite(false)
      } else {
        await api.addToFavorites(product.id)
        setIsFavorite(true)
      }
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

  if (!product) {
    return null
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--secondary-bg-color)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-color)'
          }}
        >
          ← Назад
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <img
          src={product.image_url || 'https://via.placeholder.com/400?text=No+Image'}
          alt={product.name}
          style={{
            width: '100%',
            borderRadius: '16px',
            aspectRatio: '1',
            objectFit: 'cover',
            background: '#e5e5e5'
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400?text=No+Image'
          }}
        />

        <button
          onClick={handleFavoriteToggle}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        {product.name}
      </h1>

      <div style={{ 
        fontSize: '14px', 
        color: 'var(--hint-color)', 
        marginBottom: '16px' 
      }}>
        {product.category}
      </div>

      <div style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: 'var(--button-color)',
        marginBottom: '20px'
      }}>
        {product.price} BYN
      </div>

      {product.description && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            Описание
          </h3>
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.5',
            color: 'var(--text-color)',
            whiteSpace: 'pre-wrap'
          }}>
            {product.description}
          </p>
        </div>
      )}

      <div style={{ 
        marginBottom: '20px',
        padding: '16px',
        background: 'var(--secondary-bg-color)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '14px', color: 'var(--hint-color)', marginBottom: '8px' }}>
          Наличие: {product.stock > 0 ? `✅ В наличии (${product.stock} шт.)` : '❌ Нет в наличии'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          Количество
        </div>
        <div className="quantity-controls">
          <button
            className="quantity-btn"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>{quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        right: 0,
        padding: '16px',
        background: 'var(--bg-color)',
        borderTop: '1px solid var(--border-color)',
        boxShadow: '0 -2px 10px var(--shadow-color)'
      }}>
        <button
          onClick={handleAddToCart}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '16px' }}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Нет в наличии' : `Добавить в корзину • ${product.price * quantity} BYN`}
        </button>
      </div>
    </div>
  )
}

export default ProductPage
