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
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { toast } from 'react-toastify'

const EditInvoice = ({ invoiceId, serverMode }: { invoiceId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [formData, setFormData] = useState({
    rent_amount: '',
    extra_charges: '0',
    due_date: ''
  })

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/invoices/${invoiceId}`)
        setInvoice(response.data)
        setFormData({
          rent_amount: response.data.rent_amount.toString(),
          extra_charges: (response.data.extra_charges || 0).toString(),
          due_date: response.data.due_date.split('T')[0]
        })
      } catch (error) {
        console.error('Error fetching invoice:', error)
        toast.error('Failed to load invoice')
      } finally {
        setFetching(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.put(`/invoices/${invoiceId}`, {
        rent_amount: parseFloat(formData.rent_amount),
        extra_charges: parseFloat(formData.extra_charges) || 0,
        due_date: formData.due_date
      })
      toast.success('Invoice updated successfully!')
      router.push(`/en/apps/rentals/invoices/preview/${invoiceId}`)
    } catch (error: any) {
      console.error('Error updating invoice:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update invoice'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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
          <Alert severity='error'>Invoice not found</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={`Edit Invoice ${invoice.invoice_number}`} />
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
                Invoice Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Rent Amount'
                required
                value={formData.rent_amount}
                onChange={e => setFormData({ ...formData, rent_amount: e.target.value })}
                InputProps={{
                  startAdornment: <span className='mre-2'>UGX</span>
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Extra Charges'
                value={formData.extra_charges}
                onChange={e => setFormData({ ...formData, extra_charges: e.target.value })}
                InputProps={{
                  startAdornment: <span className='mre-2'>UGX</span>
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Due Date'
                required
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Invoice'}
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

export default EditInvoice
