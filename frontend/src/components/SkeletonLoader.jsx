const SkeletonLoader = ({ type = 'product' }) => {
  if (type === 'product') {
    return (
      <div className="product-card" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
        <div style={{
          width: '100%',
          aspectRatio: '1',
          background: 'var(--secondary-bg-color)',
          borderRadius: '16px 16px 0 0'
        }} />
        <div className="product-info">
          <div style={{
            height: '16px',
            background: 'var(--secondary-bg-color)',
            borderRadius: '4px',
            marginBottom: '8px',
            width: '80%'
          }} />
          <div style={{
            height: '20px',
            background: 'var(--secondary-bg-color)',
            borderRadius: '4px',
            marginBottom: '12px',
            width: '40%'
          }} />
          <div style={{
            height: '40px',
            background: 'var(--secondary-bg-color)',
            borderRadius: '8px'
          }} />
        </div>
      </div>
    )
  }

  if (type === 'order') {
    return (
      <div style={{
        background: 'var(--secondary-bg-color)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '12px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <div style={{
          height: '20px',
          background: 'var(--bg-color)',
          borderRadius: '4px',
          marginBottom: '8px',
          width: '60%'
        }} />
        <div style={{
          height: '16px',
          background: 'var(--bg-color)',
          borderRadius: '4px',
          marginBottom: '8px',
          width: '40%'
        }} />
        <div style={{
          height: '16px',
          background: 'var(--bg-color)',
          borderRadius: '4px',
          width: '30%'
        }} />
      </div>
    )
  }

  // Default skeleton
  return (
    <div style={{
      height: '100px',
      background: 'var(--secondary-bg-color)',
      borderRadius: '12px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
  )
}

export default SkeletonLoader
