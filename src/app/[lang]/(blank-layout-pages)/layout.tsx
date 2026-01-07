// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import { SettingsProvider } from '@/contexts/SettingsContext'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  params: Promise<{ lang: string }>
}

const Layout = async (props: Props) => {
  const params = await props.params
  const { children } = props

  // Type guard to ensure lang is a valid Locale
  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  // Vars
  const direction = i18n.langDirection[lang]
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      <SettingsProvider>
        <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
      </SettingsProvider>
    </Providers>
  )
}

export default Layout
