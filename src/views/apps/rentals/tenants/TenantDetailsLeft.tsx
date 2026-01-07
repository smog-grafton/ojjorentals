// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'

interface Tenant {
  id: number
  full_name: string
  email: string | null
  phone: string
  national_id: string | null
  unit: {
    id: number
    unit_number: string
    monthly_rent: number
    property: {
      name: string
      location: string
    }
  }
  status: string
  rent_start_date: string
  invoices?: Array<{
    id: number
  }>
}

const TenantDetailsLeft = ({ tenant }: { tenant: Tenant }) => {
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

  const getStatusColor = (status: string): ThemeColor => {
    switch (status) {
      case 'active':
        return 'success'
      case 'moved_out':
        return 'default'
      case 'blacklisted':
        return 'error'
      default:
        return 'warning'
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col pbs-12 gap-6'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center justify-center gap-4'>
                <CustomAvatar
                  alt={tenant.full_name}
                  variant='rounded'
                  className='rounded-lg'
                  size={120}
                  skin='light'
                  color='primary'
                >
                  {tenant.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </CustomAvatar>
                <Typography variant='h5'>{tenant.full_name}</Typography>
                <Chip label={tenant.status} variant='tonal' color={getStatusColor(tenant.status)} size='small' className='capitalize' />
              </div>
              <div className='flex items-center justify-around flex-wrap gap-4'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar variant='rounded' color='primary' skin='light'>
                    <i className='ri-file-list-3-line' />
                  </CustomAvatar>
                  <div>
                    <Typography variant='h5'>{tenant.invoices?.length || 0}</Typography>
                    <Typography>Total Invoices</Typography>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <CustomAvatar variant='rounded' color='success' skin='light'>
                    <i className='ri-money-dollar-circle-line' />
                  </CustomAvatar>
                  <div>
                    <Typography variant='h5'>{formatCurrency(tenant.unit.monthly_rent)}</Typography>
                    <Typography>Monthly Rent</Typography>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant='h5'>Details</Typography>
              <Divider className='mlb-4' />
              <div className='flex flex-col gap-2'>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography color='text.primary' className='font-medium'>
                    Phone:
                  </Typography>
                  <Typography>{tenant.phone}</Typography>
                </div>
                {tenant.email && (
                  <div className='flex items-center flex-wrap gap-x-1.5'>
                    <Typography color='text.primary' className='font-medium'>
                      Email:
                    </Typography>
                    <Typography>{tenant.email}</Typography>
                  </div>
                )}
                {tenant.national_id && (
                  <div className='flex items-center flex-wrap gap-x-1.5'>
                    <Typography color='text.primary' className='font-medium'>
                      National ID:
                    </Typography>
                    <Typography>{tenant.national_id}</Typography>
                  </div>
                )}
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography color='text.primary' className='font-medium'>
                    Unit:
                  </Typography>
                  <Typography>{tenant.unit.unit_number} - {tenant.unit.property.name}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography color='text.primary' className='font-medium'>
                    Location:
                  </Typography>
                  <Typography>{tenant.unit.property.location}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography color='text.primary' className='font-medium'>
                    Rent Start Date:
                  </Typography>
                  <Typography>{formatDate(tenant.rent_start_date)}</Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card className='border-2 border-primary rounded'>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex justify-between'>
              <Chip label='Active Tenant' variant='tonal' size='small' color='success' className='capitalize' />
              <div className='flex items-baseline'>
                <Typography component='span' variant='h1' color='primary.main'>
                  {formatCurrency(tenant.unit.monthly_rent)}
                </Typography>
                <Typography component='sub' color='text.primary' className='self-baseline'>
                  /month
                </Typography>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <i className='ri-circle-fill text-[10px]' />
                <Typography component='span'>Unit: {tenant.unit.unit_number}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='ri-circle-fill text-[10px]' />
                <Typography component='span'>Property: {tenant.unit.property.name}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='ri-circle-fill text-[10px]' />
                <Typography component='span'>Location: {tenant.unit.property.location}</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TenantDetailsLeft
