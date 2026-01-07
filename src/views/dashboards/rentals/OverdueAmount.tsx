'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Service Imports
import api from '@/services/api'

const OverdueAmount = () => {
  const [amount, setAmount] = useState<number>(0)
  const [trend, setTrend] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        setAmount(response.data?.overdue_amount || 0)
        // Calculate trend (mock for now)
        setTrend(-5.2)
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
  const errorColor = 'var(--mui-palette-error-main)'

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { enabled: false },
    grid: {
      strokeDashArray: 6,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -27,
        left: -8,
        right: 7,
        bottom: -11
      }
    },
    stroke: {
      width: 3,
      lineCap: 'butt',
      curve: 'straight'
    },
    colors: [errorColor],
    markers: {
      size: 6,
      offsetY: 4,
      offsetX: -2,
      strokeWidth: 3,
      colors: ['transparent'],
      strokeColors: 'transparent',
      discrete: [
        {
          size: 5.5,
          seriesIndex: 0,
          strokeColor: errorColor,
          fillColor: 'var(--mui-palette-background-paper)',
          dataPointIndex: 5
        }
      ]
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    responsive: [
      {
        breakpoint: 1296,
        options: {
          chart: {
            height: 88
          }
        }
      }
    ]
  }

  // Generate sample trend data
  const maxValue = amount > 0 ? amount : 1000000
  const series = [{ 
    data: [
      Math.floor(maxValue * 0.3),
      Math.floor(maxValue * 0.4),
      Math.floor(maxValue * 0.35),
      Math.floor(maxValue * 0.45),
      Math.floor(maxValue * 0.5),
      Math.floor(maxValue * 0.6)
    ] 
  }]

  return (
    <Card>
      <CardContent>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{loading ? '...' : formatCurrency(amount)}</Typography>
          <Typography color='error.main'>{trend}%</Typography>
        </div>
        <Typography variant='subtitle1'>Overdue Amount</Typography>
      </CardContent>
      <CardContent>
        <AppReactApexCharts type='line' height={84} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default OverdueAmount
