'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter, useSearchParams } from 'next/navigation'

// Third-party Imports
import { toast } from 'react-toastify'

interface Bill {
  id: number
  reference_number?: string
  bill_type: string
  vendor?: {
    name: string
  }
  amount: number
  due_date: string
  payments?: Array<{ amount: number }>
}

const RecordBillPayment = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billIdParam = searchParams.get('bill_id')
  
  const [loading, setLoading] = useState(false)
  const [bills, setBills] = useState<Bill[]>([])
  const [billsLoading, setBillsLoading] = useState(false)
  const [billSearch, setBillSearch] = useState('')
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bill_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    reference: ''
  })

  // Debounced bill search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills(billSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [billSearch])

  const fetchBills = async (search: string = '') => {
    setBillsLoading(true)
    try {
      const params: any = {
        status: 'pending,overdue'
      }
      if (search) {
        params.search = search
      }
      const response = await api.get('/bills', { params })
      setBills(response.data || [])
      
      // If bill_id from URL, pre-select bill
      if (billIdParam && !selectedBill) {
        const bill = response.data.find((b: Bill) => b.id === Number(billIdParam))
        if (bill) {
          setSelectedBill(bill)
          const totalPaid = bill.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
          const outstanding = bill.amount - totalPaid
          setFormData(prev => ({
            ...prev,
            bill_id: billIdParam,
            amount: outstanding.toString()
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
      setBills([])
    } finally {
      setBillsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchBills()
  }, [])

  useEffect(() => {
    if (formData.bill_id) {
      const bill = bills.find(b => b.id === Number(formData.bill_id))
      if (bill) {
        setSelectedBill(bill)
        const totalPaid = bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
        const outstanding = bill.amount - totalPaid
        setFormData(prev => ({
          ...prev,
          amount: outstanding.toString()
        }))
      }
    }
  }, [formData.bill_id, bills])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!selectedBill) {
        setError('Please select a bill')
        return
      }

      await api.post(`/bills/${selectedBill.id}/record-payment`, {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        reference: formData.reference || null
      })
      toast.success('Payment recorded successfully!')
      router.push('/en/apps/rentals/bills/list')
    } catch (error: any) {
      console.error('Error recording payment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to record payment'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const totalPaid = selectedBill?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const outstanding = selectedBill ? selectedBill.amount - totalPaid : 0

  return (
    <Card>
      <CardHeader title='Record Bill Payment' />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Bill</InputLabel>
                <Select
                  value={formData.bill_id}
                  label='Select Bill'
                  onChange={(e) => setFormData(prev => ({ ...prev, bill_id: e.target.value }))}
                  disabled={billsLoading}
                >
                  {bills.map(bill => {
                    const paid = bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
                    const outstanding = bill.amount - paid
                    return (
                      <MenuItem key={bill.id} value={String(bill.id)}>
                        {bill.reference_number || `BILL-${bill.id}`} - {bill.vendor?.name || 'N/A'} - Outstanding: {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(outstanding)}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            {selectedBill && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity='info'>
                    <Typography variant='body2'>
                      <strong>Bill:</strong> {selectedBill.reference_number || `BILL-${selectedBill.id}`}<br />
                      <strong>Vendor:</strong> {selectedBill.vendor?.name || 'N/A'}<br />
                      <strong>Total Amount:</strong> {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(selectedBill.amount)}<br />
                      <strong>Amount Paid:</strong> {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(totalPaid)}<br />
                      <strong>Outstanding:</strong> {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(outstanding)}
                    </Typography>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Payment Amount'
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    InputProps={{
                      startAdornment: <Typography className='mre-2'>UGX</Typography>
                    }}
                    helperText={`Maximum: ${new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(outstanding)}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type='date'
                    label='Payment Date'
                    required
                    value={formData.payment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.payment_method}
                      label='Payment Method'
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                    >
                      <MenuItem value='cash'>Cash</MenuItem>
                      <MenuItem value='bank'>Bank</MenuItem>
                      <MenuItem value='mobile_money'>Mobile Money</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label='Reference'
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder='Payment reference (optional)'
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading || !selectedBill}>
                  {loading ? 'Recording...' : 'Record Payment'}
                </Button>
                <Button variant='outlined' onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default RecordBillPayment
