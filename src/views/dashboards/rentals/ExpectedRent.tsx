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

const ExpectedRent = () => {
  const [amount, setAmount] = useState<number>(0)
  const [trend, setTrend] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Hooks
  const theme = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        setAmount(response.data?.expected_rent || 0)
        // Calculate trend (mock for now)
        setTrend(8.2)
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
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    grid: {
      padding: {
        top: -30,
        left: -14,
        right: -4,
        bottom: -12
      },
      yaxis: {
        lines: { show: false }
      }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: ['var(--mui-palette-info-main)', 'var(--mui-palette-info-lightOpacity)'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: '48%',
        borderRadiusApplication: 'end'
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
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['Jan', 'Feb', 'Mar', 'Apr']
    },
    yaxis: {
      labels: { show: false }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          plotOptions: {
            bar: { columnWidth: '60%' }
          }
        }
      },
      {
        breakpoint: 1310,
        options: {
          chart: {
            height: 114
          },
          plotOptions: {
            bar: { borderRadius: 4 }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: {
            height: 84
          },
          plotOptions: {
            bar: { columnWidth: '45%' }
          }
        }
      }
    ]
  }

  // Generate sample data based on amount
  const maxValue = amount > 0 ? amount : 1000000
  const series = [
    {
      name: 'Expected',
      data: [
        Math.floor(maxValue * 0.6),
        Math.floor(maxValue * 0.8),
        Math.floor(maxValue * 0.7),
        Math.floor(maxValue * 0.9)
      ]
    },
    {
      name: 'Target',
      data: [
        Math.floor(maxValue * 0.4),
        Math.floor(maxValue * 0.5),
        Math.floor(maxValue * 0.3),
        Math.floor(maxValue * 0.4)
      ]
    }
  ]

  return (
    <Card>
      <CardContent>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{loading ? '...' : formatCurrency(amount)}</Typography>
          <Typography color='success.main'>+{trend}%</Typography>
        </div>
        <Typography variant='subtitle1'>Expected Rent</Typography>
      </CardContent>
      <CardContent>
        <AppReactApexCharts type='bar' height={84} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default ExpectedRent
