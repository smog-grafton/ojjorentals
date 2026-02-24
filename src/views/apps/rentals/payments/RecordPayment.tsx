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
import InputAdornment from '@mui/material/InputAdornment'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { toast } from 'react-toastify'

interface Invoice {
  id: number
  invoice_number: string
  tenant: {
    id: number
    full_name: string
  }
  total_amount: number
  payments?: Array<{ amount: number }>
}

const RecordPayment = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0]
  })

  // Debounced invoice search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices(invoiceSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [invoiceSearch])

  const fetchInvoices = async (search: string = '') => {
    setInvoicesLoading(true)
    try {
      const params: any = {
        status: 'pending,overdue',
        for_payment: true
      }
      if (search) {
        params.search = search
      }
      const response = await api.get('/invoices', { params })
      setInvoices(response.data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    if (selectedInvoice) {
      const paidAmount = selectedInvoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
      const outstanding = selectedInvoice.total_amount - paidAmount
      setFormData(prev => ({
        ...prev,
        invoice_id: selectedInvoice.id.toString(),
        amount: outstanding.toString()
      }))
    }
  }, [selectedInvoice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!selectedInvoice) {
        setError('Please select an invoice')
        return
      }

      await api.post('/payments', {
        invoice_id: selectedInvoice.id,
        tenant_id: selectedInvoice.tenant.id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date
      })
      toast.success('Payment recorded successfully!')
      router.push('/en/apps/rentals/payments')
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

  const paidAmount = selectedInvoice?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const outstanding = selectedInvoice ? selectedInvoice.total_amount - paidAmount : 0

  return (
    <Card>
      <CardHeader title='Record Payment' />
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
              <Typography variant='subtitle2' className='mbe-2'>
                Invoice Selection
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                options={invoices}
                value={selectedInvoice}
                onChange={(event, newValue) => {
                  setSelectedInvoice(newValue)
                }}
                inputValue={invoiceSearch}
                onInputChange={(event, newInputValue) => {
                  setInvoiceSearch(newInputValue)
                }}
                getOptionLabel={(option) => {
                  const paid = option.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
                  const outstanding = option.total_amount - paid
                  return `${option.invoice_number} - ${option.tenant.full_name} (Outstanding: UGX ${outstanding.toLocaleString()})`
                }}
                loading={invoicesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select Invoice'
                    required
                    placeholder='Search by invoice number, tenant name, or unit...'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {invoicesLoading ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const paid = option.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
                  const outstanding = option.total_amount - paid
                  return (
                    <li {...props} key={option.id}>
                      <div className='flex flex-col'>
                        <Typography variant='body2' className='font-medium'>
                          {option.invoice_number}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {option.tenant.full_name} • Outstanding: UGX {outstanding.toLocaleString()}
                        </Typography>
                      </div>
                    </li>
                  )
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={invoicesLoading ? 'Loading...' : 'No invoices found'}
              />
            </Grid>
            {selectedInvoice && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label='Invoice Total'
                    value={selectedInvoice.total_amount.toLocaleString()}
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label='Outstanding Amount'
                    value={outstanding.toLocaleString()}
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-2 mbe-4' />
              <Typography variant='subtitle2' className='mbe-2'>
                Payment Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Payment Amount (UGX)'
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                }}
                helperText={`Maximum: UGX ${outstanding.toLocaleString()}`}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  label='Payment Method'
                  value={formData.payment_method}
                  onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <MenuItem value='cash'>Cash</MenuItem>
                  <MenuItem value='mobile_money'>Mobile Money</MenuItem>
                  <MenuItem value='bank'>Bank Transfer</MenuItem>
                  <MenuItem value='iotec'>IoTec</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Payment Date'
                required
                value={formData.payment_date}
                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
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

export default RecordPayment
