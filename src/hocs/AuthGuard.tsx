'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (!token || !user) {
        setIsAuthenticated(false)
        return
      }

      // If we have token and user, consider authenticated
      setIsAuthenticated(true)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Only redirect if not authenticated and not already redirected
    if (isAuthenticated === false && !hasRedirected) {
      const currentPath = pathname || '/'
      // Use direct path with language prefix instead of getLocalizedUrl
      const loginPath = `/${locale}/login`
      
      // Only redirect if not already on login/register/forgot-password pages
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password')) {
        setHasRedirected(true)
        // Always redirect to rentals dashboard after login
        const redirectTo = `/${locale}/dashboards/rentals`
        router.push(`${loginPath}?redirectTo=${encodeURIComponent(redirectTo)}`)
      }
    }
  }, [isAuthenticated, hasRedirected, pathname, router, locale])

  // Show nothing while checking or redirecting
  if (isAuthenticated === null || (isAuthenticated === false && !hasRedirected)) {
    return null
  }

  // If not authenticated and redirected, show nothing (redirect is in progress)
  if (!isAuthenticated) {
    return null
  }

  // User is authenticated, show children
  return <>{children}</>
}
