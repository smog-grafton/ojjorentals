'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Service Imports
import api from '@/services/api'

interface ChartData {
  month: number
  year: number
  total: number
}

const RentCollectionChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [collectedRent, setCollectedRent] = useState<number>(0)
  const [expectedRent, setExpectedRent] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard')
        const data = response.data?.rent_collection_data || []
        setChartData(data)
        setCollectedRent(response.data?.collected_rent || 0)
        setExpectedRent(response.data?.expected_rent || 0)
      } catch (error) {
        console.error('Error fetching chart data:', error)
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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Get last 6 months data
  const last6Months = chartData.slice(-6)
  const categories = last6Months.map(item => monthNames[item.month - 1] || `M${item.month}`)
  
  // Normalize data for chart (scale to 0-100 range for better visualization)
  const maxValue = Math.max(...last6Months.map(item => item.total), 1)
  const normalizedCollected = last6Months.map(item => Math.round((item.total / maxValue) * 100))
  const normalizedExpected = last6Months.map(item => Math.round(((item.total * 1.2) / maxValue) * 100))
  const normalizedTrend = last6Months.map((item, index) => {
    const prevValue = index > 0 ? last6Months[index - 1].total : item.total
    return Math.round(((item.total - prevValue) / maxValue) * 50)
  })

  const series = [
    {
      type: 'column',
      name: 'Collected',
      data: normalizedCollected
    },
    {
      type: 'column',
      name: 'Expected',
      data: normalizedExpected.map(val => -val)
    },
    {
      type: 'line',
      name: 'Trend',
      data: normalizedTrend
    }
  ]

  const options: ApexOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    markers: {
      size: 4,
      strokeWidth: 3,
      fillOpacity: 1,
      strokeOpacity: 1,
      colors: 'var(--mui-palette-background-paper)',
      strokeColors: 'var(--mui-palette-warning-main)'
    },
    stroke: {
      curve: 'smooth',
      width: [0, 0, 3],
      colors: ['var(--mui-palette-warning-main)']
    },
    colors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-primary-lightOpacity)'],
    dataLabels: { enabled: false },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    legend: { show: false },
    grid: {
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -26,
        left: -14,
        right: -16,
        bottom: -8
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all'
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: categories.length > 0 ? categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
      }
    },
    yaxis: {
      max: 100,
      min: -100,
      show: false
    },
    tooltip: {
      y: {
        formatter: (val: number, { seriesIndex, dataPointIndex }) => {
          if (seriesIndex === 0) {
            return formatCurrency(last6Months[dataPointIndex]?.total || 0)
          } else if (seriesIndex === 1) {
            return formatCurrency((last6Months[dataPointIndex]?.total || 0) * 1.2)
          }
          return `${val}%`
        }
      }
    },
    responsive: [
      {
        breakpoint: 1286,
        options: {
          chart: {
            height: 241
          }
        }
      },
      {
        breakpoint: 692,
        options: {
          chart: {
            height: 230
          }
        }
      }
    ]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='Rent Collection' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Rent Collection'
        subheader={`Total ${formatCurrency(collectedRent)} Collected`}
        action={<OptionMenu options={['Refresh', 'Update', 'Share']} />}
      />
      <CardContent className='flex flex-col gap-11'>
        <div className='flex gap-6'>
          <div className='flex gap-3'>
            <CustomAvatar skin='light' color='primary' variant='rounded'>
              <i className='ri-funds-line' />
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography>Collected Rent</Typography>
              <Typography color='text.primary' className='font-medium'>
                {formatCurrency(collectedRent)}
              </Typography>
            </div>
          </div>
          <div className='flex gap-3'>
            <CustomAvatar skin='light' color='warning' variant='rounded'>
              <i className='ri-money-dollar-circle-line' />
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography>Expected Rent</Typography>
              <Typography color='text.primary' className='font-medium'>
                {formatCurrency(expectedRent)}
              </Typography>
            </div>
          </div>
        </div>
        <AppReactApexCharts type='line' height={263} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default RentCollectionChart
