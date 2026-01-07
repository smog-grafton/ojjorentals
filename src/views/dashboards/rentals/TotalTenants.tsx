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

const TotalTenants = () => {
  const [count, setCount] = useState<number>(0)
  const [trend, setTrend] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        setCount(response.data?.total_tenants || 0)
        // Calculate trend (mock for now, can be enhanced with actual comparison)
        setTrend(12.5)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Vars
  const primaryColor = 'var(--mui-palette-primary-main)'

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
    colors: [primaryColor],
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
          strokeColor: primaryColor,
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
  const series = [{ data: [0, 20, 5, 30, 15, count > 0 ? Math.min(count * 2, 45) : 45] }]

  return (
    <Card>
      <CardContent>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{loading ? '...' : count}</Typography>
          <Typography color='success.main'>+{trend}%</Typography>
        </div>
        <Typography variant='subtitle1'>Total Tenants</Typography>
      </CardContent>
      <CardContent>
        <AppReactApexCharts type='line' height={84} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default TotalTenants
