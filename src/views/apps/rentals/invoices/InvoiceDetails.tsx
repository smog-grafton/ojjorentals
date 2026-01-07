'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import LinearProgress from '@mui/material/LinearProgress'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { toast } from 'react-toastify'

interface Payment {
  id: number
  amount: number
  payment_method: string
  payment_date: string
  received_by: {
    name: string
  }
  receipt: {
    id: number
    receipt_number: string
  }
}

interface Invoice {
  id: number
  invoice_number: string
  tenant: {
    id: number
    full_name: string
    phone: string
    next_due_date: string | null
  }
  unit: {
    unit_number: string
    property: {
      name: string
    }
  }
  rent_amount: number
  extra_charges: number
  total_amount: number
  due_date: string
  status: string
  issued_at: string
  payments: Payment[]
}

const InvoiceDetails = ({ invoiceId, serverMode }: { invoiceId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/invoices/${invoiceId}`)
        setInvoice(response.data)
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

  const handleDownloadPDF = async () => {
    if (!invoice) return toast.error('Invoice data not available for download.')
    
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
      link.download = `invoice-${invoice.invoice_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!invoice) {
    return (
      <Card>
        <CardContent>
          <Typography>Invoice not found</Typography>
        </CardContent>
      </Card>
    )
  }

  const totalPaid = invoice.payments?.reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0
  const outstanding = invoice.total_amount - totalPaid
  const paymentProgress = (totalPaid / invoice.total_amount) * 100

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

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Invoice Details'
            action={
              <div className='flex items-center gap-2'>
                <Button
                  variant='contained'
                  component={Link}
                  href={`/en/apps/rentals/invoices/preview/${invoiceId}`}
                  startIcon={<i className='ri-eye-line' />}
                >
                  Preview
                </Button>
                <Button variant='outlined' onClick={handleDownloadPDF} startIcon={<i className='ri-file-pdf-line' />}>
                  Download PDF
                </Button>
                <Button variant='outlined' onClick={() => router.back()}>
                  Back
                </Button>
              </div>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Invoice Number
                </Typography>
                <Typography variant='h6'>{invoice.invoice_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Status
                </Typography>
                <Chip
                  label={invoice.status}
                  color={getStatusColor(invoice.status) as any}
                  size='small'
                  className='capitalize'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Tenant
                </Typography>
                <Typography variant='h6'>{invoice.tenant.full_name}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {invoice.tenant.phone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Unit
                </Typography>
                <Typography variant='h6'>
                  {invoice.unit.unit_number} - {invoice.unit.property.name}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Issued Date
                </Typography>
                <Typography variant='h6'>{formatDate(invoice.issued_at)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Due Date
                </Typography>
                <Typography variant='h6'>{formatDate(invoice.due_date)}</Typography>
              </Grid>
              {invoice.tenant.next_due_date && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Next Rent Payment Date
                  </Typography>
                  <Typography variant='h6' color='primary.main'>
                    {formatDate(invoice.tenant.next_due_date)}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Divider className='mbs-2 mbe-4' />
                <Typography variant='subtitle2' className='mbe-2'>
                  Invoice Breakdown
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Rent Amount
                </Typography>
                <Typography variant='h6'>{formatCurrency(invoice.rent_amount)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Extra Charges
                </Typography>
                <Typography variant='h6'>{formatCurrency(invoice.extra_charges)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Total Amount
                </Typography>
                <Typography variant='h5'>{formatCurrency(invoice.total_amount)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Amount Paid
                </Typography>
                <Typography variant='h5' color='success.main'>{formatCurrency(totalPaid)}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Outstanding Amount
                </Typography>
                <Typography variant='h5' color={outstanding > 0 ? 'error.main' : 'success.main'}>
                  {formatCurrency(outstanding)}
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={paymentProgress}
                  className='mts-2'
                  color={paymentProgress === 100 ? 'success' : 'primary'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Payment History'
            action={
              outstanding > 0 && (
                <Button
                  variant='contained'
                  component={Link}
                  href={`/en/apps/rentals/payments/record?invoice_id=${invoice.id}`}
                >
                  Record Payment
                </Button>
              )
            }
          />
          <Divider />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Received By</TableCell>
                    <TableCell>Receipt</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.payments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        No payments recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoice.payments?.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className='capitalize'>{payment.payment_method}</TableCell>
                        <TableCell>{payment.received_by?.name || 'N/A'}</TableCell>
                        <TableCell>{payment.receipt?.receipt_number || 'N/A'}</TableCell>
                        <TableCell>
                          {payment.receipt && (
                            <Button
                              size='small'
                              onClick={() => {
                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
                                window.open(`${apiUrl}/api/v1/receipts/${payment.receipt.id}/pdf`, '_blank')
                              }}
                            >
                              View Receipt
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default InvoiceDetails
