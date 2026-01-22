import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем Telegram initData в каждый запрос
apiClient.interceptors.request.use((config) => {
  if (window.Telegram?.WebApp?.initData) {
    config.headers.Authorization = `tma ${window.Telegram.WebApp.initData}`
  }
  return config
})

export const api = {
  // Products
  getProducts: (params) => apiClient.get('/api/products', { params }),
  getProduct: (id) => apiClient.get(`/api/products/${id}`),
  
  // Orders
  createOrder: (data) => apiClient.post('/api/orders', data),
  getOrders: () => apiClient.get('/api/orders'),
  
  // Favorites
  getFavorites: () => apiClient.get('/api/favorites'),
  addToFavorites: (productId) => apiClient.post('/api/favorites', { product_id: productId }),
  removeFromFavorites: (productId) => apiClient.delete(`/api/favorites/${productId}`),
  
  // User
  getCurrentUser: () => apiClient.get('/api/users/me'),
  
  // Bonus
  getBonusInfo: () => apiClient.get('/api/bonus/info'),
  getBonusTransactions: (limit = 20) => apiClient.get('/api/bonus/transactions', { params: { limit } }),
  
  // Saved Addresses
  getSavedAddresses: () => apiClient.get('/api/saved-addresses'),
  createSavedAddress: (data) => apiClient.post('/api/saved-addresses', data),
  updateSavedAddress: (id, data) => apiClient.put(`/api/saved-addresses/${id}`, data),
  deleteSavedAddress: (id) => apiClient.delete(`/api/saved-addresses/${id}`),
  
  // Admin
  getAdminDashboard: () => apiClient.get('/api/admin/dashboard'),
  getAdminOrders: (params) => apiClient.get('/api/admin/orders', { params }),
  getAdminOrderDetails: (id) => apiClient.get(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, status) => apiClient.patch(`/api/orders/${id}/status`, { status }),
  updateProduct: (id, data) => apiClient.patch(`/api/admin/products/${id}`, data),
}

export default apiClient
