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
  property: {
    id: number
    name: string
    location: string
  }
  tenant: {
    id: number
    full_name: string
    email: string | null
    phone: string
  } | null
  invoices: Array<{
    id: number
    invoice_number: string
    total_amount: number
    due_date: string
    status: string
  }>
}

const UnitDetails = ({ unitId, serverMode }: { unitId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!unitId) {
        setLoading(false)
        return
      }
      
      try {
        const response = await api.get(`/units/${unitId}`)
        setUnit(response.data)
      } catch (error: any) {
        console.error('Error fetching unit:', error)
        if (error.response?.status === 404) {
          // Unit not found - will be handled in render
        } else if (error.response?.status === 401) {
          // Authentication issue - will be handled by interceptor
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [unitId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'success'
      case 'vacant':
        return 'default'
      default:
        return 'warning'
    }
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

  if (!unit) {
    return (
      <Card>
        <CardContent>
          <Typography>Unit not found</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Unit Details'
            action={
              <div className='flex items-center gap-2'>
                <Button
                  variant='outlined'
                  onClick={() => router.push(`/en/apps/rentals/units/edit/${unitId}`)}
                >
                  Edit
                </Button>
                <Button variant='outlined' onClick={() => router.back()}>
                  Back
                </Button>
              </div>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Unit Number
                </Typography>
                <Typography variant='h6'>{unit.unit_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Property
                </Typography>
                <Typography variant='h6'>{unit.property.name}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {unit.property.location}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Monthly Rent
                </Typography>
                <Typography variant='h6'>{formatCurrency(unit.monthly_rent)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Status
                </Typography>
                <Chip
                  label={unit.status}
                  color={getStatusColor(unit.status) as any}
                  size='small'
                  variant='tonal'
                  className='capitalize'
                />
              </Grid>
              {unit.tenant && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider className='mbs-2 mbe-4' />
                    <Typography variant='subtitle2' className='mbe-2'>
                      Current Tenant
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant='body2' color='text.secondary' className='mbe-1'>
                      Tenant Name
                    </Typography>
                    <Typography variant='h6'>{unit.tenant.full_name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant='body2' color='text.secondary' className='mbe-1'>
                      Phone
                    </Typography>
                    <Typography variant='h6'>{unit.tenant.phone}</Typography>
                  </Grid>
                  {unit.tenant.email && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='body2' color='text.secondary' className='mbe-1'>
                        Email
                      </Typography>
                      <Typography variant='h6'>{unit.tenant.email}</Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      variant='outlined'
                      component={Link}
                      href={`/en/apps/rentals/tenants/details/${unit.tenant.id}`}
                    >
                      View Tenant Details
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {unit.invoices && unit.invoices.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Recent Invoices'
              action={
                <Button
                  size='small'
                  component={Link}
                  href='/en/apps/rentals/invoices/list'
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <div className='overflow-x-auto'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unit.invoices.slice(0, 5).map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={
                              invoice.status === 'paid'
                                ? 'success'
                                : invoice.status === 'overdue'
                                  ? 'error'
                                  : 'warning'
                            }
                            size='small'
                            variant='tonal'
                            className='capitalize'
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() =>
                              router.push(`/en/apps/rentals/invoices/details/${invoice.id}`)
                            }
                          >
                            <i className='ri-eye-line' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default UnitDetails
