'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Type Imports
import type { ThemeColor } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Service Imports
import api from '@/services/api'

// Types
type DataType = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}

const RentalsPerformance = () => {
  const [data, setData] = useState<DataType[]>([])
  const [totalSales, setTotalSales] = useState<string>('0')
  const [growth, setGrowth] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        const dashboardData = response.data || {}
        
        const formatCurrency = (value: number) => {
          return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            notation: 'compact'
          }).format(value)
        }

        setTotalSales(formatCurrency(dashboardData.collected_rent || 0))
        setGrowth(18) // Mock growth percentage

        setData([
          {
            stats: (dashboardData.total_tenants || 0).toString(),
            color: 'primary',
            title: 'Total Tenants',
            icon: 'ri-user-star-line'
          },
          {
            stats: formatCurrency(dashboardData.expected_rent || 0),
            color: 'warning',
            icon: 'ri-pie-chart-2-line',
            title: 'Expected Rent'
          },
          {
            color: 'info',
            stats: (dashboardData.total_units || 0).toString(),
            title: 'Total Units',
            icon: 'ri-building-line'
          }
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className='bs-full'>
        <CardHeader title='Rentals Performance' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Rentals Performance'
        action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <div className='flex items-center gap-2'>
            <span>Total {totalSales} Collected</span>
            <span className='flex items-center text-success font-medium'>
              +{growth}%
              <i className='ri-arrow-up-s-line text-xl' />
            </span>
          </div>
        }
      />
      <CardContent className='pbs-5'>
        <div className='flex flex-wrap justify-between gap-4'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color={item.color}>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography>{item.title}</Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RentalsPerformance
