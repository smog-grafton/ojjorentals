'use client'

// React Imports
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Service Imports
import api from '@/services/api'

interface Settings {
  company_name: string
  company_phone: string
  company_email?: string
  company_address: string
  invoice_prefix: string
  receipt_prefix: string
  default_due_days: number
  penalty_percentage: number
  mail_host?: string
  mail_port?: number
  mail_username?: string
  mail_password?: string
  mail_encryption?: string
  mail_from_address?: string
  mail_from_name?: string
  logo_path?: string
  favicon_path?: string
}

interface SettingsContextType {
  settings: Settings | null
  loading: boolean
  refresh: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refresh: async () => {}
})

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    // Check if user is authenticated (has token)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    // If no token, go directly to public endpoint
    if (!token) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
        const publicResponse = await fetch(`${apiUrl}/api/v1/settings/public`)
        if (publicResponse.ok) {
          const publicData = await publicResponse.json()
          // Merge with defaults for basic display
          setSettings({
            company_name: publicData.company_name || 'Ojjo Properties',
            company_phone: '',
            company_address: '',
            invoice_prefix: 'INV',
            receipt_prefix: 'RCT',
            default_due_days: 30,
            penalty_percentage: 0,
            logo_path: publicData.logo_path || null
          })
        } else {
          throw new Error('Public settings fetch failed')
        }
      } catch (publicError) {
        console.error('Error fetching public settings:', publicError)
        // Set defaults if fetch fails
        setSettings({
          company_name: 'Ojjo Properties',
          company_phone: '',
          company_address: '',
          invoice_prefix: 'INV',
          receipt_prefix: 'RCT',
          default_due_days: 30,
          penalty_percentage: 0
        })
      } finally {
        setLoading(false)
      }
      return
    }
    
    // If authenticated, try to fetch full settings
    try {
      const response = await api.get('/settings')
      if (response.data) {
        setSettings(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      
      // If 401 (unauthorized), try public endpoint for basic settings
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
          const publicResponse = await fetch(`${apiUrl}/api/v1/settings/public`)
          if (publicResponse.ok) {
            const publicData = await publicResponse.json()
            // Merge with defaults for basic display
            setSettings({
              company_name: publicData.company_name || 'Ojjo Properties',
              company_phone: '',
              company_address: '',
              invoice_prefix: 'INV',
              receipt_prefix: 'RCT',
              default_due_days: 30,
              penalty_percentage: 0,
              logo_path: publicData.logo_path || null
            })
          } else {
            throw new Error('Public settings fetch failed')
          }
        } catch (publicError) {
          console.error('Error fetching public settings:', publicError)
          // Set defaults if both fail
          setSettings({
            company_name: 'Ojjo Properties',
            company_phone: '',
            company_address: '',
            invoice_prefix: 'INV',
            receipt_prefix: 'RCT',
            default_due_days: 30,
            penalty_percentage: 0
          })
        }
      } else {
        // Set defaults if fetch fails for other reasons
        setSettings({
          company_name: 'Ojjo Properties',
          company_phone: '',
          company_address: '',
          invoice_prefix: 'INV',
          receipt_prefix: 'RCT',
          default_due_days: 30,
          penalty_percentage: 0
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettingsContext = () => useContext(SettingsContext)
