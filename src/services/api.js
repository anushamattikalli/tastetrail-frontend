import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const method = config.method ? config.method.toUpperCase() : 'GET'
    const url = config.url ? config.url.split('?')[0] : ''
    const isPublicAuthPost =
      method === 'POST' &&
      (url === '/users' ||
        url === '/users/' ||
        url === '/users/login' ||
        url === '/users/login/')

    if (token && !isPublicAuthPost) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: basic error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred'

    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message,
    })

    // Handle expired / invalid session for authenticated calls
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      // Dispatch event to let AuthContext clean up session gracefully
      window.dispatchEvent(new Event('auth:expired'))
    }

    return Promise.reject(error)
  }
)

export default api
