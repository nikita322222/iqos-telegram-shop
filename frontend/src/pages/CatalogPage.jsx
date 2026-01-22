import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

// Debounce функция
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const CatalogPage = ({ tg }) => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState(null)
  const [showCategories, setShowCategories] = useState(true)
  const [showSubCategories, setShowSubCategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('') // '', 'price_asc', 'price_desc'
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    inStock: false,
    badge: '' // '', 'NEW', 'ХИТ', 'СКИДКА'
  })

  // Debounce поиска
  const debouncedSearch = useDebounce(searchQuery, 300)

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

  // Check for category parameter in URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      // Find which main category contains this subcategory
      const mainCat = mainCategories.find(mc => 
        mc.subCategories.includes(categoryParam)
      )
      
      if (mainCat) {
        setSelectedMainCategory(mainCat)
        setSelectedCategory(categoryParam)
        setShowCategories(false)
        setShowSubCategories(false)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadData()
    }
  }, [selectedCategory, debouncedSearch, sortBy, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { 
        category: selectedCategory,
        search: debouncedSearch || undefined,
        sort_by: sortBy || undefined,
        min_price: filters.minPrice || undefined,
        max_price: filters.maxPrice || undefined,
        in_stock: filters.inStock || undefined,
        badge: filters.badge || undefined
      }
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

      {/* Поиск и сортировка */}
      <div style={{ marginBottom: '16px' }}>
        {/* Поиск */}
        <input
          type="text"
          placeholder="🔍 Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontSize: '15px',
            marginBottom: '12px'
          }}
        />

        {/* Сортировка и фильтры */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: showFilters ? '2px solid var(--button-color)' : '1px solid var(--border-color)',
              background: showFilters ? 'var(--button-color)' : 'var(--secondary-bg-color)',
              color: showFilters ? 'white' : 'var(--text-color)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🔧 Фильтры
          </button>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1 }}>
            <button
              onClick={() => setSortBy('')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: sortBy === '' ? '2px solid var(--button-color)' : '1px solid var(--border-color)',
                background: sortBy === '' ? 'var(--button-color)' : 'var(--secondary-bg-color)',
                color: sortBy === '' ? 'white' : 'var(--text-color)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              По умолчанию
            </button>
            <button
              onClick={() => setSortBy('price_asc')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: sortBy === 'price_asc' ? '2px solid var(--button-color)' : '1px solid var(--border-color)',
                background: sortBy === 'price_asc' ? 'var(--button-color)' : 'var(--secondary-bg-color)',
                color: sortBy === 'price_asc' ? 'white' : 'var(--text-color)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Цена ↑
            </button>
            <button
              onClick={() => setSortBy('price_desc')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: sortBy === 'price_desc' ? '2px solid var(--button-color)' : '1px solid var(--border-color)',
                background: sortBy === 'price_desc' ? 'var(--button-color)' : 'var(--secondary-bg-color)',
                color: sortBy === 'price_desc' ? 'white' : 'var(--text-color)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Цена ↓
            </button>
          </div>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div style={{
            background: 'var(--secondary-bg-color)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Цена (BYN)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="От"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="До"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Только в наличии</span>
              </label>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Метки
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['', 'NEW', 'ХИТ', 'СКИДКА'].map(badge => (
                  <button
                    key={badge}
                    onClick={() => setFilters({ ...filters, badge: badge })}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: filters.badge === badge ? '2px solid var(--button-color)' : '1px solid var(--border-color)',
                      background: filters.badge === badge ? 'var(--button-color)' : 'var(--bg-color)',
                      color: filters.badge === badge ? 'white' : 'var(--text-color)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {badge || 'Все'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setFilters({ minPrice: '', maxPrice: '', inStock: false, badge: '' })}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--hint-color)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>Товары не найдены</p>
          <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--hint-color)' }}>
            {searchQuery ? 'Попробуйте изменить запрос' : 'В этой категории пока нет товаров'}
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
