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

interface BillPayment {
  id: number
  amount: number
  payment_method: string
  payment_date: string
  reference: string
  paid_by: {
    name: string
  }
}

interface Bill {
  id: number
  reference_number?: string
  bill_type: string
  vendor?: {
    name: string
    email?: string
    phone?: string
  }
  property?: {
    name: string
    location: string
  }
  unit?: {
    unit_number: string
  }
  amount: number
  due_date: string
  status: string
  billing_period_start?: string
  billing_period_end?: string
  is_recurring: boolean
  recurrence_cycle?: string
  charge_tenants: boolean
  notes?: string
  payments: BillPayment[]
}

const BillDetails = ({ billId, serverMode }: { billId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!billId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        console.log('Fetching bill with ID:', billId)
        const response = await api.get(`/bills/${billId}`)
        console.log('Bill response:', response.data)
        setBill(response.data)
      } catch (error: any) {
        console.error('Error fetching bill:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        console.error('Request URL:', error.config?.url)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [billId])

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

  const getBillTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      water: 'Water',
      electricity: 'Electricity',
      service: 'Service',
      internet: 'Internet',
      other: 'Other'
    }
    return labels[type] || type
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

  if (!bill) {
    return (
      <Card>
        <CardContent>
          <Typography>Bill not found</Typography>
        </CardContent>
      </Card>
    )
  }

  const totalPaid = bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const outstanding = bill.amount - totalPaid
  const paymentProgress = (totalPaid / bill.amount) * 100
  const status = outstanding <= 0 ? 'paid' : bill.status

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Bill Details'
            action={
              <div className='flex items-center gap-2'>
                <Button
                  variant='contained'
                  component={Link}
                  href={`/en/apps/rentals/bills/payments/record?bill_id=${billId}`}
                  startIcon={<i className='ri-money-dollar-circle-line' />}
                  disabled={outstanding <= 0}
                >
                  Record Payment
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
                  Reference Number
                </Typography>
                <Typography variant='h6'>{bill.reference_number || `BILL-${bill.id}`}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Status
                </Typography>
                <Chip
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  color={getStatusColor(status) as any}
                  size='small'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Bill Type
                </Typography>
                <Typography variant='h6'>{getBillTypeLabel(bill.bill_type)}</Typography>
              </Grid>
              {bill.vendor && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Vendor
                  </Typography>
                  <Typography variant='h6'>{bill.vendor.name}</Typography>
                  {bill.vendor.phone && (
                    <Typography variant='caption' color='text.secondary'>
                      {bill.vendor.phone}
                    </Typography>
                  )}
                </Grid>
              )}
              {bill.property && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Property
                  </Typography>
                  <Typography variant='h6'>{bill.property.name}</Typography>
                  {bill.unit && (
                    <Typography variant='caption' color='text.secondary'>
                      Unit: {bill.unit.unit_number}
                    </Typography>
                  )}
                </Grid>
              )}
              {bill.billing_period_start && bill.billing_period_end && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Billing Period
                  </Typography>
                  <Typography variant='h6'>
                    {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Due Date
                </Typography>
                <Typography variant='h6'>{formatDate(bill.due_date)}</Typography>
              </Grid>
              {bill.is_recurring && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Recurrence
                  </Typography>
                  <Typography variant='h6' className='capitalize'>
                    {bill.recurrence_cycle}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Divider className='mbs-2 mbe-4' />
                <Typography variant='subtitle2' className='mbe-2'>
                  Bill Breakdown
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Total Amount
                </Typography>
                <Typography variant='h5'>{formatCurrency(bill.amount)}</Typography>
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
              {bill.notes && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' color='text.secondary' className='mbe-1'>
                    Notes
                  </Typography>
                  <Typography>{bill.notes}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Payment History' />
          <Divider />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Paid By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bill.payments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        No payments recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    bill.payments?.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className='capitalize'>{payment.payment_method.replace('_', ' ')}</TableCell>
                        <TableCell>{payment.reference || 'N/A'}</TableCell>
                        <TableCell>{payment.paid_by?.name || 'N/A'}</TableCell>
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

export default BillDetails
