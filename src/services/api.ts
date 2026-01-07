import axios, { AxiosError, AxiosResponse } from 'axios'

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        // Only redirect if not already on auth pages
        if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // Redirect to login with current path as redirectTo
          window.location.href = `/en/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
