import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

const CatalogPage = ({ tg }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState(null)
  const [showCategories, setShowCategories] = useState(true)
  const [showSubCategories, setShowSubCategories] = useState(false)

  const mainCategories = [
    {
      name: 'Стики',
      icon: '🚬',
      subCategories: ['Terea kz', 'Парламент ru', 'Heets kz', 'FiiT ru/kz', 'Terea arm', 'Terea eu/ind']
    },
    {
      name: 'Устройства',
      icon: '📱',
      subCategories: ['IQOS LIL SOLID DUAL', 'Iqos duos original', 'Iqos Original One', 'Iqos iluma one', 'Iqos iluma', 'Iqos iluma prime', 'Iqos iluma i series prime']
    }
  ]

  useEffect(() => {
    if (selectedCategory) {
      loadData()
    }
  }, [selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { category: selectedCategory }
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

  const handleMainCategoryClick = (mainCategory) => {
    setSelectedMainCategory(mainCategory)
    setShowCategories(false)
    setShowSubCategories(true)
  }

  const handleSubCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName)
    setShowSubCategories(false)
  }

  const handleBackToMain = () => {
    setShowCategories(true)
    setShowSubCategories(false)
    setSelectedMainCategory(null)
  }

  const handleBackToSub = () => {
    setShowSubCategories(true)
    setSelectedCategory(null)
    setProducts([])
  }

  // Показываем главные категории
  if (showCategories) {
    return (
      <div>
        <h1 className="page-title">Каталог</h1>
        <p style={{ color: 'var(--hint-color)', marginBottom: '20px' }}>
          Выберите категорию товаров
        </p>

        <div style={{ display: 'grid', gap: '16px' }}>
          {mainCategories.map(category => (
            <div
              key={category.name}
              onClick={() => handleMainCategoryClick(category)}
              style={{
                background: 'var(--secondary-bg-color)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s'
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
                background: 'var(--button-color)20',
                borderRadius: '12px'
              }}>
                {category.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {category.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--hint-color)' }}>
                  {category.subCategories.length} категорий →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Показываем подкатегории
  if (showSubCategories) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={handleBackToMain}
            style={{
              background: 'var(--secondary-bg-color)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-color)'
            }}
          >
            ← Назад
          </button>
          <h1 className="page-title" style={{ margin: 0, fontSize: '20px' }}>
            {selectedMainCategory.name}
          </h1>
        </div>

        <div className="product-grid">
          {selectedMainCategory.subCategories.map(subCategory => (
            <div
              key={subCategory}
              onClick={() => handleSubCategoryClick(subCategory)}
              style={{
                background: 'var(--secondary-bg-color)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px',
                transition: 'transform 0.2s'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                lineHeight: '1.3',
                color: 'var(--text-color)',
                marginBottom: '12px',
                flex: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                {subCategory}
              </div>
              
              <button
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubCategoryClick(subCategory)
                }}
              >
                Открыть →
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Показываем товары
  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={handleBackToSub}
          style={{
            background: 'var(--secondary-bg-color)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-color)'
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
          <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--hint-color)' }}>
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
