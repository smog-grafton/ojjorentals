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

const AddUnit = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)
  const [propertySearch, setPropertySearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    property_id: '',
    unit_number: '',
    monthly_rent: ''
  })

  // Debounced property search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties(propertySearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [propertySearch])

  const fetchProperties = async (search: string = '') => {
    setPropertiesLoading(true)
    try {
      const params: any = {}
      if (search) {
        params.search = search
      }
      const response = await api.get('/properties', { params })
      setProperties(response.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties([])
    } finally {
      setPropertiesLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchProperties()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/units', {
        ...formData,
        monthly_rent: parseFloat(formData.monthly_rent),
        status: 'vacant'
      })
      toast.success('Unit added successfully!')
      router.push('/en/apps/rentals/units/list')
    } catch (error: any) {
      console.error('Error creating unit:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create unit'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Add New Unit' />
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
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Creating...' : 'Create Unit'}
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

export default AddUnit
