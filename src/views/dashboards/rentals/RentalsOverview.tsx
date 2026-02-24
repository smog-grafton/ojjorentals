'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

// Type Imports
import type { SystemMode } from '@core/types'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettingsContext } from '@/contexts/SettingsContext'

// Service Imports
import api from '@/services/api'

const RentalsOverview = ({ serverMode }: { serverMode: SystemMode }) => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalProperties: 0,
    occupiedUnits: 0,
    collectionRate: 0
  })
  const [loading, setLoading] = useState(true)

  // Vars
  const darkImg = '/images/cards/user-john-dark.png'
  const lightImg = '/images/cards/user-john-light.png'

  // Hooks
  const image = useImageVariant(serverMode, lightImg, darkImg)
  const { settings: appSettings } = useSettingsContext()
  
  // Get company name from settings or fallback
  const companyName = appSettings?.company_name || 'Ojjo Properties'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        const data = response.data || {}
        setStats({
          totalTenants: data.total_tenants || 0,
          totalProperties: data.total_units || 0,
          occupiedUnits: data.occupied_units || 0,
          collectionRate: data.collected_rent && data.expected_rent 
            ? Math.round((data.collected_rent / data.expected_rent) * 100) 
            : 0
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className='relative bs-full'>
      <CardContent className='sm:pbe-0'>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 8 }} className='flex flex-col items-start gap-4'>
            <Typography variant='h4'>
              Welcome to <span className='font-bold'>{companyName}!</span> 🎉
            </Typography>
            <div>
              <Typography>Your rental management dashboard is ready.</Typography>
              <Typography>Monitor properties, tenants, invoices, and payments all in one place.</Typography>
            </div>
            {!loading && (
              <div className='flex flex-wrap gap-4'>
                <div className='flex flex-col'>
                  <Typography variant='h5'>{stats.totalTenants}</Typography>
                  <Typography variant='body2' color='text.secondary'>Active Tenants</Typography>
                </div>
                <div className='flex flex-col'>
                  <Typography variant='h5'>{stats.totalProperties}</Typography>
                  <Typography variant='body2' color='text.secondary'>Total Units</Typography>
                </div>
                <div className='flex flex-col'>
                  <Typography variant='h5'>{stats.collectionRate}%</Typography>
                  <Typography variant='body2' color='text.secondary'>Collection Rate</Typography>
                </div>
              </div>
            )}
            <Button variant='contained' className='mbs-2'>View Reports</Button>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} className='max-sm:-order-1 max-sm:flex max-sm:justify-center'>
            <img
              alt='Rentals Dashboard'
              src={image}
              className='max-bs-[186px] sm:absolute block-end-0 inline-end-0 max-is-full'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default RentalsOverview
