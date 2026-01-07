'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Types Imports
import type { SystemMode } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Service Imports
import api from '@/services/api'

type DataType = {
  title: string
  subtitle: string
  budget: string
  transaction: 'credit' | 'debit'
  avatarIcon: string
  color: string
}

const PropertyStatistics = ({ serverMode }: { serverMode: SystemMode }) => {
  const [data, setData] = useState<DataType[]>([])
  const [loading, setLoading] = useState(true)

  // Hooks
  const { mode } = useColorScheme()

  // Vars
  const _mode = (mode === 'system' ? serverMode : mode) || serverMode

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

        // Get top properties by rent (mock data structure - can be enhanced with actual property data)
        const propertiesData: DataType[] = [
          {
            title: 'Property A',
            subtitle: '12 Units • 85% Occupied',
            budget: formatCurrency(dashboardData.expected_rent ? dashboardData.expected_rent * 0.4 : 0),
            transaction: 'credit',
            avatarIcon: 'ri-community-line',
            color: 'primary'
          },
          {
            title: 'Property B',
            subtitle: '8 Units • 75% Occupied',
            budget: formatCurrency(dashboardData.expected_rent ? dashboardData.expected_rent * 0.3 : 0),
            transaction: 'credit',
            avatarIcon: 'ri-building-2-line',
            color: 'success'
          },
          {
            title: 'Property C',
            subtitle: '6 Units • 100% Occupied',
            budget: formatCurrency(dashboardData.expected_rent ? dashboardData.expected_rent * 0.2 : 0),
            transaction: 'credit',
            avatarIcon: 'ri-home-4-line',
            color: 'info'
          },
          {
            title: 'Property D',
            subtitle: '4 Units • 50% Occupied',
            budget: formatCurrency(dashboardData.expected_rent ? dashboardData.expected_rent * 0.1 : 0),
            transaction: 'debit',
            avatarIcon: 'ri-community-line',
            color: 'warning'
          }
        ]

        setData(propertiesData)
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
      <Card>
        <CardHeader title='Property Statistics' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Property Statistics' action={<OptionMenu options={['Refresh', 'Edit', 'Share']} />} />
      <CardContent className='flex justify-between plb-4 border-b'>
        <Typography variant='overline' color='text.secondary' className='uppercase'>
          Property
        </Typography>
        <Typography variant='overline' color='text.secondary' className='uppercase'>
          Expected Rent
        </Typography>
      </CardContent>
      <CardContent className='flex flex-col gap-[1.4063rem] max-[1310px]:gap-[2.4375rem] pbs-5'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <Avatar
              variant='rounded'
              className={classnames('bg-actionHover is-[50px] bs-[38px]', {
                'bg-white': _mode === 'dark',
                'bg-actionHover': _mode === 'light'
              })}
              sx={{ bgcolor: `var(--mui-palette-${item.color}-mainOpacity)` }}
            >
              <i className={classnames(item.avatarIcon, 'text-xl')} style={{ color: `var(--mui-palette-${item.color}-main)` }} />
            </Avatar>
            <div className='flex flex-wrap justify-between items-center gap-2 is-full'>
              <div className='flex flex-col gap-1'>
                <Typography className='font-medium' color='text.primary'>
                  {item.title}
                </Typography>
                <Typography variant='body2'>{item.subtitle}</Typography>
              </div>
              <Chip label={item.budget} color={item.color as any} size='small' variant='tonal' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default PropertyStatistics
