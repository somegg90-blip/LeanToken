// src/lib/api.js
import axios from 'axios'

// ✅ Dynamic API URL for dev + production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api/v1'

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-access-token')
  const userId = localStorage.getItem('user_id')
  
  if (userId) {
    config.headers['x-user-id'] = userId
  }
  
  return config
})

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or show auth error
      console.error('Authentication required')
    }
    return Promise.reject(error)
  }
)

// API methods
export const apiMethods = {
  // Upload CSV for analysis
  analyze: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  // Get analysis history
  getHistory: async () => {
    const response = await api.get('/history')
    return response.data
  },
  
  // Health check
  health: async () => {
    const response = await api.get('/health')
    return response.data
  },
}
