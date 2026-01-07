'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

interface Unit {
  id: number
  unit_number: string
  monthly_rent: number
  status: string
  tenant: {
    id: number
    full_name: string
  } | null
}

interface Property {
  id: number
  name: string
  location: string
  units: Unit[]
}

const PropertyDetails = ({ propertyId, serverMode }: { propertyId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/properties/${propertyId}`)
        setProperty(response.data)
      } catch (error) {
        console.error('Error fetching property:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [propertyId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!property) {
    return (
      <Card>
        <CardContent>
          <Typography>Property not found</Typography>
        </CardContent>
      </Card>
    )
  }

  const occupiedUnits = property.units?.filter(u => u.status === 'occupied').length || 0
  const vacantUnits = property.units?.filter(u => u.status === 'vacant').length || 0
  const totalUnits = property.units?.length || 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Property Details'
            action={
              <Button variant='outlined' onClick={() => router.back()}>
                Back
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Property Name
                </Typography>
                <Typography variant='h6'>{property.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Location
                </Typography>
                <Typography variant='h6'>{property.location}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Total Units
                </Typography>
                <Typography variant='h5'>{totalUnits}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Occupied Units
                </Typography>
                <Typography variant='h5' color='success.main'>{occupiedUnits}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Vacant Units
                </Typography>
                <Typography variant='h5' color='text.secondary'>{vacantUnits}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Units'
            action={
              <Button
                variant='contained'
                component={Link}
                href={`/en/apps/rentals/units/add?property_id=${property.id}`}
                startIcon={<i className='ri-add-line' />}
              >
                Add Unit
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Unit Number</TableCell>
                    <TableCell>Monthly Rent</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {property.units?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        No units found
                      </TableCell>
                    </TableRow>
                  ) : (
                    property.units?.map(unit => (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <Typography className='font-medium'>{unit.unit_number}</Typography>
                        </TableCell>
                        <TableCell>{formatCurrency(unit.monthly_rent)}</TableCell>
                        <TableCell>
                          <Chip
                            label={unit.status}
                            color={unit.status === 'occupied' ? 'success' : 'default'}
                            size='small'
                            className='capitalize'
                          />
                        </TableCell>
                        <TableCell>
                          {unit.tenant ? (
                            <Button
                              size='small'
                              component={Link}
                              href={`/en/apps/rentals/tenants/details/${unit.tenant.id}`}
                            >
                              {unit.tenant.full_name}
                            </Button>
                          ) : (
                            <Typography color='text.secondary'>Vacant</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() => router.push(`/en/apps/rentals/units/list`)}
                          >
                            <i className='ri-eye-line' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PropertyDetails
