'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import api from '@/services/api'

interface Invoice {
  id: number
  invoice_number: string
  tenant: {
    full_name: string
  }
  unit: {
    unit_number: string
    property: {
      name: string
    }
  }
  total_amount: number
  due_date: string
  status: string
}

const RecentInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        setInvoices(response.data?.recent_invoices || [])
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'overdue':
        return 'error'
      default:
        return 'warning'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='Recent Invoices' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader 
        title='Recent Invoices'
        action={
          <Button component={Link} href='/en/apps/rentals/invoices/list' size='small'>
            View All
          </Button>
        }
      />
      <div className='overflow-x-auto pbe-3'>
        <table className={tableStyles.table}>
          <thead className='uppercase'>
            <tr className='border-be'>
              <th className='bg-transparent bs-11 font-normal'>Invoice #</th>
              <th className='bg-transparent bs-11 font-normal'>Tenant</th>
              <th className='bg-transparent bs-11 font-normal'>Property</th>
              <th className='bg-transparent bs-11 text-end font-normal'>Amount</th>
              <th className='bg-transparent bs-11 text-end font-normal'>Due Date</th>
              <th className='bg-transparent bs-11 text-end font-normal'>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center'>
                  <Typography>No invoices found</Typography>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className='border-0'>
                  <td>
                    <Typography className='font-medium' color='text.primary'>
                      {invoice.invoice_number}
                    </Typography>
                  </td>
                  <td>
                    <Typography>{invoice.tenant.full_name}</Typography>
                  </td>
                  <td>
                    <Typography variant='body2'>{invoice.unit.property.name} - {invoice.unit.unit_number}</Typography>
                  </td>
                  <td className='text-end'>
                    <Typography color='text.primary' className='font-medium'>
                      {formatCurrency(invoice.total_amount)}
                    </Typography>
                  </td>
                  <td className='text-end'>
                    <Typography variant='body2'>{formatDate(invoice.due_date)}</Typography>
                  </td>
                  <td className='text-end'>
                    <Chip 
                      label={invoice.status} 
                      color={getStatusColor(invoice.status)}
                      size='small'
                      variant='tonal'
                      className='capitalize'
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default RecentInvoices
