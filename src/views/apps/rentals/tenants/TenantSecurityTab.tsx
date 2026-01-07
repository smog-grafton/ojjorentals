// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

interface Tenant {
  id: number
  security_deposit_paid?: boolean
  invoices?: Array<{
    security_deposit: number
  }>
}

const TenantSecurityTab = ({ tenant }: { tenant: Tenant }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const securityDeposit = tenant.invoices?.find(inv => inv.security_deposit > 0)?.security_deposit || 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Security Deposit' />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Deposit Amount
                </Typography>
                <Typography variant='h5'>{formatCurrency(securityDeposit)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='body2' color='text.secondary' className='mbe-1'>
                  Status
                </Typography>
                <Chip
                  label={tenant.security_deposit_paid ? 'Paid' : 'Pending'}
                  color={tenant.security_deposit_paid ? 'success' : 'warning'}
                  size='small'
                />
              </Grid>
              {securityDeposit > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Divider className='mbs-2 mbe-4' />
                  <Typography variant='body2' color='text.secondary'>
                    Security deposits are refundable upon tenant move-out, subject to property condition and outstanding balances.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TenantSecurityTab
