'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Service Imports
import api from '@/services/api'

const CollectedRent = () => {
  const [amount, setAmount] = useState<number>(0)
  const [trend, setTrend] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Hooks
  const theme = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        setAmount(response.data?.collected_rent || 0)
        // Calculate trend (mock for now)
        setTrend(15.3)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
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
      notation: 'compact'
    }).format(value)
  }

  // Vars
  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    stroke: { lineCap: 'round' },
    colors: ['var(--mui-palette-success-main)'],
    grid: {
      padding: {
        bottom: -10
      }
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '55%' },
        track: {
          background: 'var(--mui-palette-customColors-trackBg)'
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontWeight: 500,
            fontSize: '0.9375rem',
            color: 'var(--mui-palette-text-primary)'
          }
        }
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    responsive: [
      {
        breakpoint: 1310,
        options: {
          chart: {
            height: 130
          },
          plotOptions: {
            radialBar: {
              offsetY: 26
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: {
            height: 104
          },
          plotOptions: {
            radialBar: {
              offsetY: 10
            }
          }
        }
      }
    ]
  }

  // Calculate percentage based on collected vs expected (mock for now)
  const percentage = amount > 0 ? Math.min(Math.floor((amount / (amount * 1.5)) * 100), 100) : 0
  const series = [percentage]

  return (
    <Card className='bs-full'>
      <CardContent>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{loading ? '...' : formatCurrency(amount)}</Typography>
          <Typography color='success.main'>+{trend}%</Typography>
        </div>
        <Typography variant='subtitle1'>Collected Rent</Typography>

        <AppReactApexCharts type='radialBar' height={104} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default CollectedRent
