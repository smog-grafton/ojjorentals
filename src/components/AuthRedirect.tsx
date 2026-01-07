'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const login = `/${lang}/login`
    const homePage = `/${lang}${themeConfig.homePageUrl}`
    
    // Don't redirect if already on login page
    if (pathname?.includes('/login')) {
      return
    }

    // Always redirect to rentals dashboard after login (replace crm if present)
    let redirectTo = homePage
    if (pathname && pathname.includes('/dashboards/')) {
      // If it's crm, replace with rentals, otherwise use the pathname
      redirectTo = pathname.includes('/dashboards/crm') ? homePage : pathname
    }
    const redirectUrl = `${login}?redirectTo=${encodeURIComponent(redirectTo)}`
    router.push(redirectUrl)
  }, [router, pathname, lang])

  // Show loading or nothing while redirecting
  return null
}

export default AuthRedirect
