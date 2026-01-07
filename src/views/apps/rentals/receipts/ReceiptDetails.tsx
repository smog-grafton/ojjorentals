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

interface Receipt {
  id: number
  receipt_number: string
  payment: {
    id: number
    amount: number
    payment_method: string
    payment_date: string
    invoice: {
      id: number
      invoice_number: string
      total_amount: number
      due_date: string
      unit: {
        unit_number: string
        property: {
          name: string
          location: string
        }
      }
    }
    tenant: {
      id: number
      full_name: string
      phone: string
      email: string | null
      next_due_date: string | null
    }
  }
  issued_by: {
    name: string
    email: string
  }
  issued_at: string
}

const ReceiptDetails = ({ receiptId, serverMode }: { receiptId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/receipts/${receiptId}`)
        setReceipt(response.data)
      } catch (error) {
        console.error('Error fetching receipt:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [receiptId])

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
    if (!receipt) return toast.error('Receipt data not available for download.')
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const token = localStorage.getItem('token')
      
      // Fetch PDF with authentication
      const response = await fetch(`${apiUrl}/api/v1/receipts/${receiptId}/pdf?download=1`, {
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
      link.download = `receipt-${receipt.receipt_number}.pdf`
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

  if (!receipt) {
    return (
      <Card>
        <CardContent>
          <Typography>Receipt not found</Typography>
        </CardContent>
      </Card>
    )
  }

  const invoice = receipt.payment.invoice
  const tenant = receipt.payment.tenant

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Receipt Details'
            action={
              <div className='flex items-center gap-2'>
                <Button
                  variant='contained'
                  component={Link}
                  href={`/en/apps/rentals/invoices/preview/${invoice.id}`}
                  startIcon={<i className='ri-file-text-line' />}
                >
                  View Invoice
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
                  Receipt Number
                </Typography>
                <Typography variant='h6'>{receipt.receipt_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Status
                </Typography>
                <Chip label='Paid' color='success' size='small' />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Tenant
                </Typography>
                <Typography variant='h6'>{tenant.full_name}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {tenant.phone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Unit
                </Typography>
                <Typography variant='h6'>
                  {invoice.unit.unit_number} - {invoice.unit.property.name}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {invoice.unit.property.location}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Issued Date
                </Typography>
                <Typography variant='h6'>{formatDate(receipt.issued_at)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Payment Date
                </Typography>
                <Typography variant='h6'>{formatDate(receipt.payment.payment_date)}</Typography>
              </Grid>
              {tenant.next_due_date && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Next Rent Payment Date
                  </Typography>
                  <Typography variant='h6' color='primary.main'>
                    {formatDate(tenant.next_due_date)}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Divider className='mbs-2 mbe-4' />
                <Typography variant='subtitle2' className='mbe-2'>
                  Payment Information
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Amount Paid
                </Typography>
                <Typography variant='h5' color='success.main'>
                  {formatCurrency(receipt.payment.amount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Payment Method
                </Typography>
                <Chip
                  label={receipt.payment.payment_method.replace('_', ' ')}
                  color='primary'
                  variant='tonal'
                  className='capitalize'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Invoice Number
                </Typography>
                <Button
                  variant='text'
                  onClick={() => router.push(`/en/apps/rentals/invoices/preview/${invoice.id}`)}
                >
                  {invoice.invoice_number}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Invoice Total
                </Typography>
                <Typography variant='h6'>{formatCurrency(invoice.total_amount)}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider className='mbs-2 mbe-4' />
                <Typography variant='subtitle2' className='mbe-2'>
                  Issued By
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Staff Name
                </Typography>
                <Typography variant='h6'>{receipt.issued_by.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Email
                </Typography>
                <Typography variant='h6'>{receipt.issued_by.email}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Related Invoice Information'
            action={
              <Button
                variant='contained'
                component={Link}
                href={`/en/apps/rentals/invoices/preview/${invoice.id}`}
              >
                View Full Invoice
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Invoice Due Date
                </Typography>
                <Typography variant='h6'>{formatDate(invoice.due_date)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Payment Status
                </Typography>
                <Chip label='Paid' color='success' size='small' />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ReceiptDetails
