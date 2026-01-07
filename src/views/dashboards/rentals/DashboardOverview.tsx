'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'

// Type Imports
import type { Mode } from '@core/types'

const DashboardOverview = ({ serverMode }: { serverMode: Mode }) => {
  return (
    <Card>
      <CardHeader title='Rentals Dashboard' />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          Welcome to your property rental management system. Monitor your properties, tenants, invoices, and payments all in one place.
        </Typography>
      </CardContent>
    </Card>
  )
}

export default DashboardOverview
