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
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Component Imports
import SearchableSelect from '@/components/rentals/SearchableSelect'

// Third-party Imports
import { toast } from 'react-toastify'

const EditBill = ({ billId, serverMode }: { billId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    property_id: '',
    unit_id: '',
    vendor_id: '',
    bill_type: 'water',
    reference_number: '',
    billing_period_start: '',
    billing_period_end: '',
    amount: '',
    due_date: '',
    is_recurring: false,
    recurrence_cycle: 'monthly',
    charge_tenants: false,
    notes: ''
  })

  useEffect(() => {
    if (!billId) {
      setError('Bill ID is required')
      setFetching(false)
      return
    }

    const fetchBill = async () => {
      try {
        console.log('Fetching bill with ID:', billId)
        const response = await api.get(`/bills/${billId}`)
        console.log('Bill response:', response.data)
        const bill = response.data
        
        if (!bill) {
          setError('Bill not found')
          setFetching(false)
          return
        }
        setFormData({
          property_id: bill.property_id ? String(bill.property_id) : '',
          unit_id: bill.unit_id ? String(bill.unit_id) : '',
          vendor_id: bill.vendor_id ? String(bill.vendor_id) : '',
          bill_type: bill.bill_type || 'water',
          reference_number: bill.reference_number || '',
          billing_period_start: bill.billing_period_start || '',
          billing_period_end: bill.billing_period_end || '',
          amount: String(bill.amount),
          due_date: bill.due_date ? bill.due_date.split('T')[0] : '',
          is_recurring: bill.is_recurring || false,
          recurrence_cycle: bill.recurrence_cycle || 'monthly',
          charge_tenants: bill.charge_tenants || false,
          notes: bill.notes || ''
        })
      } catch (error: any) {
        console.error('Error fetching bill:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        console.error('Request URL:', error.config?.url)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load bill'
        setError(errorMessage)
      } finally {
        setFetching(false)
      }
    }

    fetchBill()
  }, [billId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: any = {
        ...formData,
        property_id: formData.property_id || null,
        unit_id: formData.unit_id || null,
        vendor_id: formData.vendor_id || null,
        amount: parseFloat(formData.amount),
        billing_period_start: formData.billing_period_start || null,
        billing_period_end: formData.billing_period_end || null,
        recurrence_cycle: formData.is_recurring ? formData.recurrence_cycle : null,
        notes: formData.notes || null
      }

      await api.put(`/bills/${billId}`, payload)
      toast.success('Bill updated successfully!')
      router.push('/en/apps/rentals/bills/list')
    } catch (error: any) {
      console.error('Error updating bill:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update bill'
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

  return (
    <Card>
      <CardHeader title='Edit Bill' />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchableSelect
                label='Property'
                value={formData.property_id ? Number(formData.property_id) : null}
                onChange={(value) => setFormData(prev => ({ ...prev, property_id: value ? String(value) : '', unit_id: '' }))}
                endpoint='/properties'
                getOptionLabel={(option) => `${option.name} - ${option.location}`}
                getOptionValue={(option) => option.id}
                placeholder='Select property (optional)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchableSelect
                label='Unit'
                value={formData.unit_id ? Number(formData.unit_id) : null}
                onChange={(value) => setFormData(prev => ({ ...prev, unit_id: value ? String(value) : '' }))}
                endpoint='/units'
                getOptionLabel={(option) => `${option.unit_number} - ${option.property?.name || 'N/A'}`}
                getOptionValue={(option) => option.id}
                filterParams={formData.property_id ? { property_id: formData.property_id } : {}}
                placeholder='Select unit (optional)'
                disabled={!formData.property_id}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchableSelect
                label='Vendor'
                value={formData.vendor_id ? Number(formData.vendor_id) : null}
                onChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value ? String(value) : '' }))}
                endpoint='/vendors'
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder='Select vendor (optional)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Bill Type</InputLabel>
                <Select
                  value={formData.bill_type}
                  label='Bill Type'
                  onChange={(e) => setFormData(prev => ({ ...prev, bill_type: e.target.value }))}
                >
                  <MenuItem value='water'>Water</MenuItem>
                  <MenuItem value='electricity'>Electricity</MenuItem>
                  <MenuItem value='service'>Service</MenuItem>
                  <MenuItem value='internet'>Internet</MenuItem>
                  <MenuItem value='other'>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Reference Number'
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                placeholder='Bill reference number (optional)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Billing Period Start'
                value={formData.billing_period_start}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_period_start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Billing Period End'
                value={formData.billing_period_end}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_period_end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Amount'
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography className='mre-2'>UGX</Typography>
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
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                  />
                }
                label='Recurring Bill'
              />
            </Grid>
            {formData.is_recurring && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Recurrence Cycle</InputLabel>
                  <Select
                    value={formData.recurrence_cycle}
                    label='Recurrence Cycle'
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_cycle: e.target.value }))}
                  >
                    <MenuItem value='monthly'>Monthly</MenuItem>
                    <MenuItem value='quarterly'>Quarterly</MenuItem>
                    <MenuItem value='yearly'>Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.charge_tenants}
                    onChange={(e) => setFormData(prev => ({ ...prev, charge_tenants: e.target.checked }))}
                  />
                }
                label='Charge to Tenants'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Notes'
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder='Additional notes (optional)'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Bill'}
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

export default EditBill
