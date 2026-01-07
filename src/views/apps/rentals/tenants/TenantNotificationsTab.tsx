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
import Divider from '@mui/material/Divider'

interface Tenant {
  id: number
  reminders?: Array<{
    id: number
    type: string
    status: string
    created_at: string
    invoice?: {
      invoice_number: string
    }
  }>
}

const TenantNotificationsTab = ({ tenant }: { tenant: Tenant }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      upcoming: 'Upcoming Payment',
      due_today: 'Due Today',
      overdue: 'Overdue',
      demand: 'Demand Note'
    }
    return labels[type] || type
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Reminders & Notifications' />
          <Divider />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!tenant.reminders || tenant.reminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center'>
                        No reminders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenant.reminders.map(reminder => (
                      <TableRow key={reminder.id}>
                        <TableCell>{getTypeLabel(reminder.type)}</TableCell>
                        <TableCell>{reminder.invoice?.invoice_number || 'N/A'}</TableCell>
                        <TableCell>{formatDate(reminder.created_at)}</TableCell>
                        <TableCell>
                          <Chip
                            label={reminder.status}
                            color={reminder.status === 'sent' ? 'success' : 'warning'}
                            size='small'
                            className='capitalize'
                          />
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

export default TenantNotificationsTab
