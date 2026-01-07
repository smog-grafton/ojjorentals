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

const EditProperty = ({ propertyId, serverMode }: { propertyId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  })

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${propertyId}`)
        setFormData({
          name: response.data.name,
          location: response.data.location
        })
      } catch (error) {
        console.error('Error fetching property:', error)
        toast.error('Failed to load property')
      } finally {
        setFetching(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.put(`/properties/${propertyId}`, formData)
      toast.success('Property updated successfully!')
      router.push('/en/apps/rentals/properties/list')
    } catch (error: any) {
      console.error('Error updating property:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update property'
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
      <CardHeader title='Edit Property' />
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
                Property Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Property Name'
                placeholder='Green Valley Apartments'
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Location'
                placeholder='Kampala Road'
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Property'}
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

export default EditProperty
