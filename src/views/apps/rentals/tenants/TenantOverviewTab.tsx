// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

interface Tenant {
  id: number
  full_name: string
  unit: {
    monthly_rent: number
  }
  invoices: Array<{
    id: number
    total_amount: number
    status: string
  }>
  payments: Array<{
    amount: number
  }>
}

const TenantOverviewTab = ({ tenant }: { tenant: Tenant }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const totalInvoices = tenant.invoices?.length || 0
  const totalPaid = tenant.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const totalExpected = tenant.invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0
  const paymentProgress = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Rent Summary' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 6 }} className='flex flex-col gap-4'>
                <div>
                  <Typography color='text.primary' className='font-medium'>
                    Monthly Rent
                  </Typography>
                  <Typography variant='h4'>{formatCurrency(tenant.unit.monthly_rent)}</Typography>
                </div>
                <div>
                  <Typography color='text.primary' className='font-medium'>
                    Total Invoices
                  </Typography>
                  <Typography variant='h4'>{totalInvoices}</Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className='flex items-center justify-between'>
                  <Typography color='text.primary' className='font-medium'>
                    Payment Progress
                  </Typography>
                  <Typography color='text.primary' className='font-medium'>
                    {formatCurrency(totalPaid)} of {formatCurrency(totalExpected)}
                  </Typography>
                </div>
                <LinearProgress variant='determinate' value={paymentProgress} className='mlb-1 bs-2.5' />
                <Typography variant='body2'>{paymentProgress.toFixed(1)}% paid</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Quick Stats' />
          <Divider />
          <CardContent>
            <div className='flex items-center justify-around flex-wrap gap-4'>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='ri-file-list-3-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>{totalInvoices}</Typography>
                  <Typography>Total Invoices</Typography>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='success' skin='light'>
                  <i className='ri-money-dollar-circle-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>{formatCurrency(totalPaid)}</Typography>
                  <Typography>Total Paid</Typography>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='warning' skin='light'>
                  <i className='ri-bill-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>{formatCurrency(totalExpected - totalPaid)}</Typography>
                  <Typography>Outstanding</Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TenantOverviewTab
