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

interface Tenant {
  id: number
  full_name: string
  unit: {
    id: number
    unit_number: string
    monthly_rent: number
    property: {
      id: number
      name: string
      security_deposit_enabled: boolean
    }
  }
}

const AddInvoice = ({ serverMode, tenantId, isFirst }: { serverMode: Mode; tenantId?: string; isFirst?: boolean }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(false)
  const [tenantSearch, setTenantSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isFirstInvoice, setIsFirstInvoice] = useState(false)
  const [formData, setFormData] = useState({
    tenant_id: '',
    unit_id: '',
    rent_amount: '',
    extra_charges: '0',
    security_deposit: '0',
    advance_months: '0',
    due_date: ''
  })
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  // Debounced tenant search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants(tenantSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [tenantSearch])

  const fetchTenants = async (search: string = '') => {
    setTenantsLoading(true)
    try {
      const params: any = { status: 'active' }
      if (search) {
        params.search = search
      }
      const response = await api.get('/tenants', { params })
      setTenants(response.data || [])
      
      // If tenant_id from props, pre-select tenant
      if (tenantId && !selectedTenant) {
        const tenant = response.data.find((t: Tenant) => t.id === Number(tenantId))
        if (tenant) {
          setSelectedTenant(tenant)
          // Check if tenant has no invoices - automatically enable first invoice mode
          if (!tenant.billing_initialized || !tenant.invoices || tenant.invoices.length === 0) {
            setIsFirstInvoice(true)
          }
          setFormData(prev => ({
            ...prev,
            tenant_id: tenantId,
            unit_id: tenant.unit.id.toString(),
            rent_amount: tenant.unit.monthly_rent.toString(),
            due_date: new Date().toISOString().split('T')[0]
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
      setTenants([])
    } finally {
      setTenantsLoading(false)
    }
  }

  // Fetch settings for default due days
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        if (response.data && response.data.default_due_days) {
          const defaultDueDate = new Date()
          defaultDueDate.setDate(defaultDueDate.getDate() + response.data.default_due_days)
          setFormData(prev => ({
            ...prev,
            due_date: prev.due_date || defaultDueDate.toISOString().split('T')[0]
          }))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // Initial load
  useEffect(() => {
    // Check if this is a first invoice from props
    if (isFirst && tenantId) {
      setIsFirstInvoice(true)
      setFormData(prev => ({ ...prev, tenant_id: tenantId }))
    }
    fetchTenants()
  }, [tenantId, isFirst])

  useEffect(() => {
    if (formData.tenant_id) {
      const tenant = tenants.find(t => t.id === Number(formData.tenant_id))
      if (tenant) {
        setSelectedTenant(tenant)
        // Check if tenant has no invoices - automatically enable first invoice mode
        const fetchTenantDetails = async () => {
          try {
            const tenantResponse = await api.get(`/tenants/${tenant.id}`)
            const tenantData = tenantResponse.data
            if (!tenantData.billing_initialized || !tenantData.invoices || tenantData.invoices.length === 0) {
              setIsFirstInvoice(true)
            }
          } catch (error) {
            console.error('Error fetching tenant details:', error)
          }
        }
        fetchTenantDetails()
        
        setFormData(prev => ({
          ...prev,
          unit_id: tenant.unit.id.toString(),
          rent_amount: tenant.unit.monthly_rent.toString(),
          due_date: prev.due_date || new Date().toISOString().split('T')[0]
        }))
      }
    }
  }, [formData.tenant_id, tenants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: any = {
        ...formData,
        rent_amount: parseFloat(formData.rent_amount),
        extra_charges: parseFloat(formData.extra_charges) || 0,
        is_first_invoice: isFirstInvoice
      }
      
      if (isFirstInvoice) {
        payload.security_deposit = parseFloat(formData.security_deposit) || 0
        payload.advance_months = parseInt(formData.advance_months) || 0
      }
      
      await api.post('/invoices', payload)
      toast.success('Invoice created successfully!')
      
      // If first invoice, suggest recording payment
      if (isFirstInvoice) {
        toast.info('Please record the payment for this invoice.')
        router.push('/en/apps/rentals/payments/record')
      } else {
        router.push('/en/apps/rentals/invoices/list')
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create invoice'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    const rent = parseFloat(formData.rent_amount) || 0
    const extra = parseFloat(formData.extra_charges) || 0
    const deposit = isFirstInvoice ? (parseFloat(formData.security_deposit) || 0) : 0
    const advanceMonths = isFirstInvoice ? (parseInt(formData.advance_months) || 0) : 0
    const advanceAmount = advanceMonths * rent
    
    return rent + extra + deposit + advanceAmount
  }
  
  const totalAmount = calculateTotal()

  return (
    <Card>
      <CardHeader 
        title={isFirstInvoice ? 'Create First Invoice (With Advance & Deposit)' : 'Generate New Invoice'} 
      />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        {isFirstInvoice && (
          <Alert severity='info' className='mbe-4'>
            This is the first invoice for this tenant. You can include advance rent payments and security deposit.
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' className='mbe-2'>
                Tenant & Unit Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                fullWidth
                options={tenants}
                value={selectedTenant}
                onChange={(event, newValue) => {
                  setSelectedTenant(newValue)
                  if (newValue) {
                    // Check if tenant has no invoices
                    const fetchTenantDetails = async () => {
                      try {
                        const tenantResponse = await api.get(`/tenants/${newValue.id}`)
                        const tenantData = tenantResponse.data
                        if (!tenantData.billing_initialized || !tenantData.invoices || tenantData.invoices.length === 0) {
                          setIsFirstInvoice(true)
                        } else {
                          setIsFirstInvoice(false)
                        }
                      } catch (error) {
                        console.error('Error fetching tenant details:', error)
                      }
                    }
                    fetchTenantDetails()
                    
                    setFormData(prev => ({
                      ...prev,
                      tenant_id: newValue.id.toString(),
                      unit_id: newValue.unit.id.toString(),
                      rent_amount: newValue.unit.monthly_rent.toString(),
                      due_date: prev.due_date || new Date().toISOString().split('T')[0]
                    }))
                  } else {
                    setFormData(prev => ({ ...prev, tenant_id: '', unit_id: '', rent_amount: '' }))
                  }
                }}
                inputValue={tenantSearch}
                onInputChange={(event, newInputValue) => {
                  setTenantSearch(newInputValue)
                }}
                getOptionLabel={(option) => `${option.full_name} - ${option.unit.unit_number} (${option.unit.property.name})`}
                loading={tenantsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select Tenant'
                    required
                    placeholder='Search by name, phone, or unit...'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {tenantsLoading ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div className='flex flex-col'>
                      <Typography variant='body2' className='font-medium'>
                        {option.full_name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {option.unit.unit_number} • {option.unit.property.name} • {(option as any).phone}
                      </Typography>
                    </div>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={tenantsLoading ? 'Loading...' : 'No tenants found'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Unit'
                value={selectedTenant?.unit.unit_number || ''}
                disabled
                helperText='Auto-filled based on selected tenant'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-2 mbe-4' />
              <Typography variant='subtitle2' className='mbe-2'>
                Invoice Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Rent Amount (UGX)'
                required
                value={formData.rent_amount}
                onChange={e => setFormData({ ...formData, rent_amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                }}
                helperText={selectedTenant && `Default: ${selectedTenant.unit.monthly_rent.toLocaleString()}`}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Extra Charges (UGX)'
                value={formData.extra_charges}
                onChange={e => setFormData({ ...formData, extra_charges: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                }}
                helperText='Water, maintenance, etc.'
              />
            </Grid>
            {isFirstInvoice && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Divider className='mbs-2 mbe-4' />
                  <Typography variant='subtitle2' className='mbe-2'>
                    First Invoice Options
                  </Typography>
                </Grid>
                {selectedTenant?.unit.property.security_deposit_enabled && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Security Deposit (UGX)'
                      value={formData.security_deposit}
                      onChange={e => setFormData({ ...formData, security_deposit: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                      }}
                      helperText='Refundable deposit (paid once)'
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Advance Months'
                    value={formData.advance_months}
                    onChange={e => setFormData({ ...formData, advance_months: e.target.value })}
                    inputProps={{ min: 0, max: 12 }}
                    helperText='Number of months paid in advance (0-12)'
                  />
                </Grid>
              </>
            )}
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Total Amount (UGX)'
                value={totalAmount.toLocaleString()}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position='start'>UGX</InputAdornment>
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Invoice'}
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

export default AddInvoice
