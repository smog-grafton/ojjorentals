// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Tenant {
  id: number
  invoices: Array<{
    id: number
    invoice_number: string
    total_amount: number
    due_date: string
    status: string
  }>
  payments: Array<{
    id: number
    amount: number
    payment_method: string
    payment_date: string
    invoice: {
      invoice_number: string
    }
  }>
}

const TenantBillingTab = ({ tenant }: { tenant: Tenant }) => {
  const router = useRouter()
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

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Invoices'
            action={
              <Button
                size='small'
                variant='contained'
                component={Link}
                href={`/en/apps/rentals/invoices/add?tenant_id=${tenant.id}`}
              >
                Create Invoice
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
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
                  {tenant.invoices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenant.invoices?.map(invoice => (
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
                            className='capitalize'
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() => router.push(`/en/apps/rentals/invoices/preview/${invoice.id}`)}
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
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Payments'
            action={
              <Button
                size='small'
                variant='contained'
                component={Link}
                href={`/en/apps/rentals/payments/record?tenant_id=${tenant.id}`}
              >
                Record Payment
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenant.payments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center'>
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenant.payments?.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell>{payment.invoice?.invoice_number || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className='capitalize'>{payment.payment_method}</TableCell>
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

export default TenantBillingTab
