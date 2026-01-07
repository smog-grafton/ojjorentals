'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'

// Component Imports
import TenantDetailsLeft from './TenantDetailsLeft'
import TenantRight from './TenantRight'

// Hook Imports
import { useFirstInvoiceGuard } from '@/hooks/useFirstInvoiceGuard'

interface Tenant {
  id: number
  full_name: string
  email: string | null
  phone: string
  national_id: string | null
  unit: {
    id: number
    unit_number: string
    monthly_rent: number
    property: {
      name: string
      location: string
    }
  }
  status: string
  rent_start_date: string
  invoices: Array<{
    id: number
    invoice_number: string
    total_amount: number
    due_date: string
    status: string
    security_deposit: number
  }>
  payments: Array<{
    id: number
    amount: number
    payment_method: string
    payment_date: string
    invoice: {
      invoice_number: string
    }
  }>
  reminders?: Array<{
    id: number
    type: string
    status: string
    created_at: string
    invoice?: {
      invoice_number: string
    }
  }>
  security_deposit_paid?: boolean
}

const TenantDetailsRefactored = ({ tenantId, serverMode }: { tenantId: string; serverMode: Mode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if tenant requires first invoice
  useFirstInvoiceGuard(tenantId)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/tenants/${tenantId}`)
        setTenant(response.data)
      } catch (error) {
        console.error('Error fetching tenant:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantId])

  if (loading || !tenant) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div>Loading...</div>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <TenantDetailsLeft tenant={tenant} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <TenantRight tenant={tenant} />
      </Grid>
    </Grid>
  )
}

export default TenantDetailsRefactored
