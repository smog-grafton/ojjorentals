'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

// Service Imports
import api from '@/services/api'

interface OverdueAlert {
  id: number
  invoice_number: string
  tenant: {
    full_name: string
  }
  unit: {
    unit_number: string
    property: {
      name: string
    }
  }
  total_amount: number
  due_date: string
}

const OverdueAlerts = () => {
  const [alerts, setAlerts] = useState<OverdueAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        setAlerts(response.data?.overdue_alerts || [])
      } catch (error) {
        console.error('Error fetching overdue alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  if (loading) {
    return (
      <Card>
        <CardHeader title='Overdue Alerts' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader 
        title='Overdue Alerts'
        action={
          <Button component={Link} href='/en/apps/rentals/overdue' size='small'>
            View All
          </Button>
        }
      />
      {alerts.length === 0 ? (
        <CardContent>
          <Typography color='text.secondary'>No overdue invoices</Typography>
        </CardContent>
      ) : (
        <CardContent className='pbs-0'>
          <List className='plb-0'>
            {alerts.map((alert, index) => (
              <div key={alert.id}>
                <ListItem className='plb-4'>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <i className='ri-alarm-line' />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant='body2' className='font-medium'>
                        {alert.tenant.full_name}
                      </Typography>
                    }
                    secondary={
                      <div className='flex flex-col gap-1'>
                        <Typography variant='caption' color='text.secondary' component='span'>
                          {alert.invoice_number}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' component='span'>
                          {formatCurrency(alert.total_amount)} • Due: {formatDate(alert.due_date)}
                        </Typography>
                      </div>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < alerts.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </CardContent>
      )}
    </Card>
  )
}

export default OverdueAlerts
