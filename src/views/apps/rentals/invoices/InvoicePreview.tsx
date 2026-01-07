'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import PreviewActions from './PreviewActions'

// Context Imports
import { useSettingsContext } from '@/contexts/SettingsContext'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import './print.css'

interface Invoice {
  id: number
  invoice_number: string
  tenant: {
    id: number
    full_name: string
    phone: string
    email: string
  }
  unit: {
    unit_number: string
    property: {
      name: string
      location: string
    }
  }
  rent_amount: number
  extra_charges: number
  previous_balance: number
  security_deposit: number
  total_amount: number
  due_date: string
  status: string
  issued_at: string
  payments: Array<{
    id: number
    amount: number
  }>
}

interface Settings {
  company_name: string
  company_phone: string
  company_email?: string
  company_address: string
}

const InvoicePreview = ({ invoiceId, serverMode }: { invoiceId: string; serverMode: Mode }) => {
  const router = useRouter()
  const { settings: appSettings } = useSettingsContext()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceResponse, settingsResponse] = await Promise.all([
          api.get(`/invoices/${invoiceId}`),
          api.get('/settings')
        ])
        setInvoice(invoiceResponse.data)
        setSettings(settingsResponse.data)
      } catch (error) {
        console.error('Error fetching invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [invoiceId])

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

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const token = localStorage.getItem('token')
      
      // Fetch PDF with authentication
      const response = await fetch(`${apiUrl}/api/v1/invoices/${invoiceId}/pdf?download=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoice?.invoice_number || invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading || !invoice || !settings) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  const totalPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const outstanding = invoice.total_amount - totalPaid

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 9 }}>
        <Card className='previewCard'>
          <CardContent className='sm:!p-12'>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <div className='p-6 bg-actionHover rounded'>
                  <div className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                    <div className='flex flex-col gap-6'>
                      <div className='flex items-center gap-2.5'>
                        <Logo />
                      </div>
                      <div>
                        <Typography color='text.primary'>{settings?.company_name || appSettings?.company_name || 'Vinkyaba Rentals'}</Typography>
                        <Typography color='text.primary'>{settings?.company_address || appSettings?.company_address || ''}</Typography>
                        <Typography color='text.primary'>Tel: {settings?.company_phone || appSettings?.company_phone || ''}</Typography>
                        {(settings?.company_email || appSettings?.company_email) && (
                          <Typography color='text.primary'>Email: {settings?.company_email || appSettings?.company_email}</Typography>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col gap-6'>
                      <Typography variant='h5'>{`Invoice #${invoice.invoice_number}`}</Typography>
                      <div className='flex flex-col gap-1'>
                        <Typography color='text.primary'>{`Date Issued: ${formatDate(invoice.issued_at)}`}</Typography>
                        <Typography color='text.primary'>{`Date Due: ${formatDate(invoice.due_date)}`}</Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <div className='flex flex-col gap-4'>
                      <Typography className='font-medium' color='text.primary'>
                        Invoice To:
                      </Typography>
                      <div>
                        <Typography>{invoice.tenant.full_name}</Typography>
                        <Typography>{invoice.tenant.phone}</Typography>
                        <Typography>{invoice.tenant.email}</Typography>
                        <Typography>{invoice.unit.property.name}, {invoice.unit.unit_number}</Typography>
                        <Typography>{invoice.unit.property.location}</Typography>
                      </div>
                    </div>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <div className='flex flex-col gap-4'>
                      <Typography className='font-medium' color='text.primary'>
                        Bill To:
                      </Typography>
                      <div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Total Due:</Typography>
                          <Typography>{formatCurrency(outstanding)}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Total Paid:</Typography>
                          <Typography>{formatCurrency(totalPaid)}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Status:</Typography>
                          <Typography className='capitalize'>{invoice.status}</Typography>
                        </div>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <div className='overflow-x-auto border rounded'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr className='border-be'>
                        <th className='!bg-transparent'>Item</th>
                        <th className='!bg-transparent'>Description</th>
                        <th className='!bg-transparent'>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.previous_balance > 0 && (
                        <tr>
                          <td>
                            <Typography color='text.primary'>Previous Balance</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>Outstanding from previous invoices</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{formatCurrency(invoice.previous_balance)}</Typography>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <Typography color='text.primary'>Monthly Rent</Typography>
                        </td>
                        <td>
                          <Typography color='text.primary'>Rent for {formatDate(invoice.due_date)}</Typography>
                        </td>
                        <td>
                          <Typography color='text.primary'>{formatCurrency(invoice.rent_amount)}</Typography>
                        </td>
                      </tr>
                      {invoice.extra_charges > 0 && (
                        <tr>
                          <td>
                            <Typography color='text.primary'>Extra Charges</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>Additional fees</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{formatCurrency(invoice.extra_charges)}</Typography>
                          </td>
                        </tr>
                      )}
                      {invoice.security_deposit > 0 && (
                        <tr>
                          <td>
                            <Typography color='text.primary'>Security Deposit</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>Refundable security deposit</Typography>
                          </td>
                          <td>
                            <Typography color='text.primary'>{formatCurrency(invoice.security_deposit)}</Typography>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <div className='flex justify-between flex-col gap-y-4 sm:flex-row'>
                  <div className='flex flex-col gap-1 order-2 sm:order-[unset]'>
                    <Typography>Thanks for your business</Typography>
                  </div>
                  <div className='min-is-[200px]'>
                    <div className='flex items-center justify-between'>
                      <Typography>Subtotal:</Typography>
                      <Typography className='font-medium' color='text.primary'>
                        {formatCurrency(invoice.rent_amount + invoice.extra_charges + invoice.previous_balance)}
                      </Typography>
                    </div>
                    {invoice.security_deposit > 0 && (
                      <div className='flex items-center justify-between'>
                        <Typography>Security Deposit:</Typography>
                        <Typography className='font-medium' color='text.primary'>
                          {formatCurrency(invoice.security_deposit)}
                        </Typography>
                      </div>
                    )}
                    <Divider className='mlb-2' />
                    <div className='flex items-center justify-between'>
                      <Typography>Total:</Typography>
                      <Typography className='font-medium' color='text.primary'>
                        {formatCurrency(invoice.total_amount)}
                      </Typography>
                    </div>
                    {totalPaid > 0 && (
                      <>
                        <div className='flex items-center justify-between mts-2'>
                          <Typography>Amount Paid:</Typography>
                          <Typography className='font-medium' color='success.main'>
                            {formatCurrency(totalPaid)}
                          </Typography>
                        </div>
                        <div className='flex items-center justify-between'>
                          <Typography>Outstanding:</Typography>
                          <Typography className='font-medium' color={outstanding > 0 ? 'error.main' : 'success.main'}>
                            {formatCurrency(outstanding)}
                          </Typography>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider className='border-dashed' />
              </Grid>
              <Grid size={{ xs: 12 }}>
                  <Typography>
                  <Typography component='span' className='font-medium' color='text.primary'>
                    Note:
                  </Typography>{' '}
                  Please ensure payment is made by {formatDate(invoice.due_date)} to avoid late fees. For any questions, please contact us at {settings?.company_phone || appSettings?.company_phone || ''}.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <PreviewActions
          invoiceId={invoiceId}
          tenantEmail={invoice.tenant.email}
          onButtonClick={handlePrint}
          onDownloadPDF={handleDownloadPDF}
        />
      </Grid>
    </Grid>
  )
}

export default InvoicePreview
