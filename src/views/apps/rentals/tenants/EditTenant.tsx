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
  property: {
    name: string
  }
}

interface Tenant {
  id: number
  full_name: string
  email: string | null
  phone: string
  national_id: string | null
  unit_id: number
  status: string
  rent_start_date: string
}

const EditTenant = ({ tenantId, serverMode }: { tenantId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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
    status: 'active',
    rent_start_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) {
        setError('Invalid tenant ID')
        setFetching(false)
        return
      }
      
      try {
        const [tenantResponse, unitsResponse] = await Promise.all([
          api.get(`/tenants/${tenantId}`),
          api.get('/units')
        ])
        
        const tenant: Tenant = tenantResponse.data
        if (!tenant) {
          setError('Tenant not found')
          setFetching(false)
          return
        }
        
        setFormData({
          full_name: tenant.full_name,
          email: tenant.email || '',
          phone: tenant.phone,
          national_id: tenant.national_id || '',
          unit_id: tenant.unit_id.toString(),
          status: tenant.status,
          rent_start_date: tenant.rent_start_date.split('T')[0]
        })
        
        // Find and set selected unit
        const currentUnit = unitsResponse.data.find((u: Unit) => u.id === tenant.unit_id)
        if (currentUnit) {
          setSelectedUnit(currentUnit)
        }
        
        setUnits(unitsResponse.data || [])
      } catch (error: any) {
        console.error('Error fetching data:', error)
        if (error.response?.status === 404) {
          setError('Tenant not found. Please check the tenant ID and try again.')
        } else if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.')
        } else {
          setError(error.response?.data?.message || 'Failed to load tenant data. Please try again.')
        }
      } finally {
        setFetching(false)
      }
    }

    fetchData()
  }, [tenantId])

  // Debounced unit search
  useEffect(() => {
    if (!fetching) {
      const timer = setTimeout(() => {
        fetchUnits(unitSearch)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [unitSearch, fetching])

  const fetchUnits = async (search: string = '') => {
    setUnitsLoading(true)
    try {
      const params: any = {}
      if (search) {
        params.search = search
      }
      const response = await api.get('/units', { params })
      setUnits(response.data || [])
      
      // Re-select current unit if it exists
      if (formData.unit_id && !selectedUnit) {
        const currentUnit = response.data.find((u: Unit) => u.id === Number(formData.unit_id))
        if (currentUnit) {
          setSelectedUnit(currentUnit)
        }
      }
    } catch (error) {
      console.error('Error fetching units:', error)
      setUnits([])
    } finally {
      setUnitsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.put(`/tenants/${tenantId}`, formData)
      toast.success('Tenant updated successfully!')
      router.push('/en/apps/rentals/tenants/list')
    } catch (error: any) {
      console.error('Error updating tenant:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update tenant'
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
        <CardHeader title='Edit Tenant' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Edit Tenant' />
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
                noOptionsText={unitsLoading ? 'Loading...' : 'No units found'}
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
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='moved_out'>Moved Out</MenuItem>
                  <MenuItem value='blacklisted'>Blacklisted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Tenant'}
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

export default EditTenant
