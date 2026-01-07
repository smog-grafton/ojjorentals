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
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { toast } from 'react-toastify'

interface Property {
  id: number
  name: string
  location: string
}

interface Unit {
  id: number
  property_id: number
  unit_number: string
  monthly_rent: number
  status: string
}

const EditUnit = ({ unitId, serverMode }: { unitId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)
  const [propertySearch, setPropertySearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    property_id: '',
    unit_number: '',
    monthly_rent: '',
    status: 'vacant'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, propertiesResponse] = await Promise.all([
          api.get(`/units/${unitId}`),
          api.get('/properties')
        ])
        
        const unit: Unit = unitResponse.data
        if (!unit) {
          setError('Unit not found')
          setFetching(false)
          return
        }
        
        setFormData({
          property_id: unit.property_id.toString(),
          unit_number: unit.unit_number,
          monthly_rent: unit.monthly_rent.toString(),
          status: unit.status
        })
        
        // Find and set selected property
        const currentProperty = propertiesResponse.data.find((p: Property) => p.id === unit.property_id)
        if (currentProperty) {
          setSelectedProperty(currentProperty)
        }
        
        setProperties(propertiesResponse.data || [])
      } catch (error: any) {
        console.error('Error fetching data:', error)
        if (error.response?.status === 404) {
          setError('Unit not found. Please check the unit ID and try again.')
        } else if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.')
        } else {
          setError(error.response?.data?.message || 'Failed to load unit data. Please try again.')
        }
      } finally {
        setFetching(false)
      }
    }

    if (unitId) {
      fetchData()
    } else {
      setError('Invalid unit ID')
      setFetching(false)
    }
  }, [unitId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.put(`/units/${unitId}`, {
        ...formData,
        monthly_rent: parseFloat(formData.monthly_rent)
      })
      toast.success('Unit updated successfully!')
      router.push('/en/apps/rentals/units/list')
    } catch (error: any) {
      console.error('Error updating unit:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update unit'
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
        <CardHeader title='Edit Unit' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Edit Unit' />
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
                Unit Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                fullWidth
                options={properties}
                value={selectedProperty}
                onChange={(event, newValue) => {
                  setSelectedProperty(newValue)
                  setFormData(prev => ({
                    ...prev,
                    property_id: newValue ? newValue.id.toString() : ''
                  }))
                }}
                inputValue={propertySearch}
                onInputChange={(event, newInputValue) => {
                  setPropertySearch(newInputValue)
                }}
                getOptionLabel={(option) => `${option.name} - ${option.location}`}
                loading={propertiesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select Property'
                    required
                    placeholder='Search by property name or location...'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {propertiesLoading ? <CircularProgress color='inherit' size={20} /> : null}
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
                        {option.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {option.location}
                      </Typography>
                    </div>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={propertiesLoading ? 'Loading...' : 'No properties found'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Unit Number'
                placeholder='A-101'
                required
                value={formData.unit_number}
                onChange={e => setFormData({ ...formData, unit_number: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Monthly Rent (UGX)'
                placeholder='500000'
                required
                value={formData.monthly_rent}
                onChange={e => setFormData({ ...formData, monthly_rent: e.target.value })}
                InputProps={{
                  startAdornment: <span className='mre-2'>UGX</span>
                }}
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
                  <MenuItem value='vacant'>Vacant</MenuItem>
                  <MenuItem value='occupied'>Occupied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Unit'}
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

export default EditUnit
