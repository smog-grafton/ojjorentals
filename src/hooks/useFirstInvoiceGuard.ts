'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import { toast } from 'react-toastify'

/**
 * Hook to check if tenant requires first invoice and redirect if needed
 */
export const useFirstInvoiceGuard = (tenantId: string | number | null | undefined) => {
  const router = useRouter()

  useEffect(() => {
    const checkBillingStatus = async () => {
      if (!tenantId) return

      try {
        const response = await api.get(`/tenants/${tenantId}`)
        const tenant = response.data

        // Check if tenant has no invoices
        if (!tenant.billing_initialized && (!tenant.invoices || tenant.invoices.length === 0)) {
          toast.warning('This tenant requires a first invoice before proceeding.')
          router.push(`/en/apps/rentals/invoices/add?tenant_id=${tenantId}&is_first=true`)
        }
      } catch (error) {
        console.error('Error checking tenant billing status:', error)
      }
    }

    checkBillingStatus()
  }, [tenantId, router])
}
