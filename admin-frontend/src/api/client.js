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
  // Dashboard
  getDashboard: () => apiClient.get('/api/admin/dashboard'),
  
  // Products
  getProducts: (params) => apiClient.get('/api/admin/products', { params }),
  createProduct: (data) => apiClient.post('/api/admin/products', data),
  updateProduct: (id, data) => apiClient.put(`/api/admin/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/api/admin/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/api/admin/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Categories
  getCategories: () => apiClient.get('/api/admin/categories'),
  createCategory: (data) => apiClient.post('/api/admin/categories', data),
  updateCategory: (id, data) => apiClient.put(`/api/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/api/admin/categories/${id}`),
  
  // Orders
  getOrders: (params) => apiClient.get('/api/admin/orders', { params }),
  updateOrderStatus: (id, status) => apiClient.patch(`/api/orders/${id}/status`, { status }),
  
  // Customers
  getCustomers: (params) => apiClient.get('/api/admin/customers', { params }),
}

export default apiClient
