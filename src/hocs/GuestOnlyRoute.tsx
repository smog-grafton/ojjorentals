'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const GuestOnlyRoute = ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasRedirected) return

    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    // If user is authenticated, redirect to home (but only once)
    if (token && user) {
      const homePath = getLocalizedUrl(themeConfig.homePageUrl, lang)
      // Only redirect if not already on home page
      if (!pathname?.includes(themeConfig.homePageUrl)) {
        setHasRedirected(true)
        router.push(homePath)
      }
    }
  }, [router, lang, pathname, hasRedirected])

  // If redirecting, show nothing
  if (hasRedirected) {
    return null
  }

  // Show children (login/register pages) for unauthenticated users
  return <>{children}</>
}

export default GuestOnlyRoute
