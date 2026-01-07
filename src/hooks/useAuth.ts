'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/services/api'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'admin' | 'staff'
  status: 'active' | 'inactive'
}

export const useAuth = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!token) {
        setLoading(false)
        if (pathname?.includes('/login') || pathname?.includes('/register') || pathname?.includes('/forgot-password')) {
          return
        }
        router.push('/en/login')
        return
      }

      // Set user from localStorage immediately
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          // Invalid JSON, clear it
          localStorage.removeItem('user')
        }
      }

      // Verify token with backend (only if not on auth pages)
      if (!pathname?.includes('/login') && !pathname?.includes('/register') && !pathname?.includes('/forgot-password')) {
        try {
          const response = await api.get('/auth/me')
          const userData = response.data
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setLoading(false)
        } catch (error) {
          // Token invalid, clear storage and redirect
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setLoading(false)
          // Don't redirect if already on auth pages to avoid loops
          if (!pathname?.includes('/login') && !pathname?.includes('/register') && !pathname?.includes('/forgot-password')) {
            router.push('/en/login')
          }
        }
      } else {
        // On auth pages, just set loading to false
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      router.push('/en/login')
    }
  }

  return { user, loading, logout }
}

export default useAuth
