// src/lib/api.js
// ✅ Dynamic API URL: Works in dev AND production

const getApiUrl = () => {
  // Vercel sets VERCEL_ENV automatically
  if (process.env.NODE_ENV === 'production') {
    // ✅ Use your live Render backend
    return process.env.NEXT_PUBLIC_API_URL || 'https://leantoken-api.onrender.com/api/v1'
  }
  // ✅ Local development
  return 'http://localhost:10000/api/v1'
}

export const API_BASE_URL = getApiUrl()

// Helper for authenticated requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('sb-access-token') // Supabase auth token
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'x-user-id': token }), // Or use Authorization header
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `API error: ${response.status}`)
  }
  
  return response.json()
}

// Specific API methods
export const api = {
  analyze: (formData) => 
    fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData, // FormData for file upload
      headers: {
        'x-user-id': localStorage.getItem('sb-access-token'),
      },
    }).then(res => res.json()),
    
  getHistory: () => 
    apiRequest('/history'),
    
  health: () => 
    fetch(`${API_BASE_URL}/health`).then(res => res.json()),
}
