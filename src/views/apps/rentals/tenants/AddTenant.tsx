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
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { toast } from 'react-toastify'

interface Unit {
  id: number
  unit_number: string
  monthly_rent: number
  status: string
  property: {
    name: string
  }
}

const AddTenant = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [unitSearch, setUnitSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    national_id: '',
    unit_id: '',
    rent_start_date: new Date().toISOString().split('T')[0]
  })

  // Debounced unit search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUnits(unitSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [unitSearch])

  const fetchUnits = async (search: string = '') => {
    setUnitsLoading(true)
    try {
      const params: any = { status: 'vacant' }
      if (search) {
        params.search = search
      }
      const response = await api.get('/units', { params })
      setUnits(response.data || [])
    } catch (error) {
      console.error('Error fetching units:', error)
      setUnits([])
    } finally {
      setUnitsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchUnits()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/tenants', formData)
      toast.success('Tenant added successfully!')
      
      // If tenant requires first invoice, redirect to invoice creation
      if (response.data.requires_first_invoice) {
        router.push(`/en/apps/rentals/invoices/add?tenant_id=${response.data.tenant.id}&is_first=true`)
      } else {
        router.push('/en/apps/rentals/tenants/list')
      }
    } catch (error: any) {
      console.error('Error creating tenant:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create tenant'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Add New Tenant' />
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
                Personal Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Full Name'
                placeholder='John Doe'
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='email'
                label='Email'
                placeholder='john.doe@example.com'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Phone Number'
                placeholder='+256 700 000 000'
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='National ID'
                placeholder='CM123456789'
                value={formData.national_id}
                onChange={e => setFormData({ ...formData, national_id: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-2 mbe-4' />
              <Typography variant='subtitle2' className='mbe-2'>
                Unit Assignment
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                fullWidth
                options={units}
                value={selectedUnit}
                onChange={(event, newValue) => {
                  setSelectedUnit(newValue)
                  setFormData(prev => ({
                    ...prev,
                    unit_id: newValue ? newValue.id.toString() : ''
                  }))
                }}
                inputValue={unitSearch}
                onInputChange={(event, newInputValue) => {
                  setUnitSearch(newInputValue)
                }}
                getOptionLabel={(option) => `${option.unit_number} - ${option.property.name} (UGX ${option.monthly_rent.toLocaleString()}/month)`}
                loading={unitsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select Unit'
                    required
                    placeholder='Search by unit number or property...'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {unitsLoading ? <CircularProgress color='inherit' size={20} /> : null}
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
                        {option.unit_number}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {option.property.name} • UGX {option.monthly_rent.toLocaleString()}/month
                      </Typography>
                    </div>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={unitsLoading ? 'Loading...' : units.length === 0 ? 'No vacant units available' : 'No units found'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Rent Start Date'
                required
                value={formData.rent_start_date}
                onChange={e => setFormData({ ...formData, rent_start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Creating...' : 'Create Tenant'}
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

export default AddTenant
