'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Service Imports
import api from '@/services/api'

// Type Imports
import type { Mode } from '@core/types'
import type { ThemeColor } from '@core/types'

interface ReportData {
  financial_overview: {
    total_collected: number
    total_expected: number
    total_outstanding: number
    total_overdue: number
    collection_rate: number
  }
  property_performance: Array<{
    id: number
    name: string
    collected_rent: number
  }>
  tenant_insights: {
    active_tenants: number
    tenants_with_overdue: number
    tenants_without_invoice: number
  }
  occupancy_stats: {
    total_units: number
    occupied_units: number
    vacant_units: number
    occupancy_rate: number
  }
  operational_alerts: {
    overdue_invoices_count: number
    overdue_amount: number
    pending_deposits_count: number
    uninitialized_tenants_count: number
  }
  rent_collection_trend: Array<{
    month: string
    collected: number
    expected: number
  }>
  payment_status_breakdown: {
    paid: number
    pending: number
    overdue: number
    counts: {
      paid: number
      pending: number
      overdue: number
    }
  }
  top_tenants: Array<{
    id: number
    name: string
    total_paid: number
  }>
  overdue_analysis: {
    by_days: {
      '0-7': number
      '8-30': number
      '31-60': number
      '60+': number
    }
    total_amount: number
  }
  bills_data: {
    total_bills: number
    total_paid: number
    outstanding: number
    overdue: number
    paid_count: number
    pending_count: number
    overdue_count: number
  }
  expenses_data: {
    total_expenses: number
    monthly_expenses: Array<{ month: string; amount: number }>
    count: number
  }
  income_vs_expenses: {
    total_income: number
    total_expenses: number
    net_profit: number
    profit_margin: number
    monthly_data: Array<{ month: string; income: number; expenses: number; profit: number }>
  }
  expense_categories: Array<{ name: string; amount: number }>
}

const ReportsView = ({ serverMode }: { serverMode: Mode }) => {
  const theme = useTheme()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/reports?period=${period}`)
        setReportData(response.data)
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value)
  }

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading || !reportData) {
    return (
      <Card>
        <CardHeader title='Reports' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Financial Overview Cards (using HorizontalWithSubtitle pattern)
  const financialCards: UserDataType[] = [
    {
      title: 'Total Collected',
      stats: formatCurrency(reportData.financial_overview.total_collected),
      avatarIcon: 'ri-money-dollar-circle-line',
      avatarColor: 'success',
      trend: 'positive',
      trendNumber: `${reportData.financial_overview.collection_rate.toFixed(1)}%`,
      subtitle: 'Collection Rate'
    },
    {
      title: 'Total Expected',
      stats: formatCurrency(reportData.financial_overview.total_expected),
      avatarIcon: 'ri-file-list-3-line',
      avatarColor: 'primary',
      trend: 'positive',
      trendNumber: '100%',
      subtitle: 'Expected Rent'
    },
    {
      title: 'Outstanding',
      stats: formatCurrency(reportData.financial_overview.total_outstanding),
      avatarIcon: 'ri-time-line',
      avatarColor: 'warning',
      trend: 'negative',
      trendNumber: '0%',
      subtitle: 'Unpaid Amount'
    },
    {
      title: 'Overdue',
      stats: formatCurrency(reportData.financial_overview.total_overdue),
      avatarIcon: 'ri-alarm-warning-line',
      avatarColor: 'error',
      trend: 'negative',
      trendNumber: '0%',
      subtitle: 'Overdue Amount'
    },
  ]

  // Rent Collection Trend (Area Chart - exact pattern from ApexAreaChart)
  const areaColors = {
    series1: '#ab7efd',
    series2: '#b992fe',
    series3: '#e0cffe'
  }

  const collectionTrendOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { shared: false },
    dataLabels: { enabled: false },
    stroke: {
      show: false,
      curve: 'straight'
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      fontSize: '13px',
      markers: {
        offsetY: 2,
        offsetX: theme.direction === 'rtl' ? 7 : -4
      },
      itemMargin: { horizontal: 9 }
    },
    colors: [areaColors.series3, areaColors.series2, areaColors.series1],
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      show: true,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
        formatter: (val: number) => formatCurrency(val)
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: 'var(--mui-palette-divider)' },
      crosshairs: {
        stroke: { color: 'var(--mui-palette-divider)' }
      },
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
      },
      categories: reportData.rent_collection_trend.map(d => d.month)
    }
  }

  const collectionTrendSeries = [
    {
      name: 'Collected',
      data: reportData.rent_collection_trend.map(d => d.collected)
    },
    {
      name: 'Expected',
      data: reportData.rent_collection_trend.map(d => d.expected)
    }
  ]

  // Payment Status Donut (exact pattern from ApexDonutChart)
  const donutColors = {
    series1: '#fdd835',
    series2: '#00d4bd',
    series3: '#826bf8',
    series4: '#32baff',
    series5: '#ffa1a1'
  }

  const paymentStatusOptions: ApexOptions = {
    stroke: { width: 0 },
    labels: ['Paid', 'Pending', 'Overdue'],
    colors: [donutColors.series2, donutColors.series1, donutColors.series5],
    dataLabels: {
      enabled: true,
      formatter: (val: string) => `${parseInt(val, 10)}%`
    },
    legend: {
      fontSize: '13px',
      position: 'bottom',
      markers: {
        offsetX: theme.direction === 'rtl' ? 7 : -4
      },
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      itemMargin: {
        horizontal: 9
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              fontSize: '1.2rem'
            },
            value: {
              fontSize: '1.2rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: (val: string) => `${parseInt(val, 10)}`
            },
            total: {
              show: true,
              fontSize: '1.2rem',
              label: 'Total Invoices',
              formatter: () => {
                const total = reportData.payment_status_breakdown.counts.paid +
                  reportData.payment_status_breakdown.counts.pending +
                  reportData.payment_status_breakdown.counts.overdue
                return total.toString()
              },
              color: 'var(--mui-palette-text-primary)'
            }
          }
        }
      }
    }
  }

  const paymentStatusSeries = [
    reportData.payment_status_breakdown.paid,
    reportData.payment_status_breakdown.pending,
    reportData.payment_status_breakdown.overdue,
  ]

  // Property Performance (Column Chart - exact pattern from ApexColumnChart)
  const columnColors = {
    bg: '#f8d3ff',
    series1: '#826af9',
    series2: '#d2b0ff'
  }

  const propertyPerformanceOptions: ApexOptions = {
    chart: {
      offsetX: -10,
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    fill: { opacity: 1 },
    dataLabels: { enabled: false },
    colors: [columnColors.series1, columnColors.series2],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      markers: {
        offsetY: 2,
        offsetX: theme.direction === 'rtl' ? 7 : -4,
        radius: 12
      },
      itemMargin: {
        horizontal: 9
      }
    },
    stroke: {
      show: true,
      colors: ['transparent']
    },
    plotOptions: {
      bar: {
        columnWidth: '15%',
        colors: {
          backgroundBarRadius: 10,
          backgroundBarColors: [columnColors.bg, columnColors.bg, columnColors.bg, columnColors.bg, columnColors.bg]
        }
      }
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
        formatter: (val: number) => formatCurrency(val)
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: 'var(--mui-palette-divider)' },
      categories: reportData.property_performance.slice(0, 9).map(p => p.name),
      crosshairs: {
        stroke: { color: 'var(--mui-palette-divider)' }
      },
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
      }
    }
  }

  const propertyPerformanceSeries = [
    {
      name: 'Collected Rent',
      data: reportData.property_performance.slice(0, 9).map(p => p.collected_rent)
    }
  ]

  // Occupancy Radial Chart (exact pattern from ApexRadialBarChart)
  const radialBarColors = {
    series1: '#fdd835',
    series2: '#32baff',
    series3: '#00d4bd',
    series4: '#7367f0',
    series5: '#FFA1A1'
  }

  const occupancyOptions: ApexOptions = {
    stroke: { lineCap: 'round' },
    labels: ['Occupancy Rate'],
    legend: {
      show: true,
      fontSize: '13px',
      position: 'bottom',
      labels: {
        colors: 'var(--mui-palette-text-secondary)'
      },
      markers: {
        offsetX: theme.direction === 'rtl' ? 7 : -4
      },
      itemMargin: {
        horizontal: 9
      }
    },
    colors: [radialBarColors.series3],
    plotOptions: {
      radialBar: {
        hollow: { size: '30%' },
        track: {
          margin: 15,
          background: 'var(--mui-palette-customColors-trackBg)'
        },
        dataLabels: {
          name: {
            fontSize: '2rem'
          },
          value: {
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--mui-palette-text-secondary)',
            formatter: (val: string) => `${parseInt(val, 10)}%`
          },
          total: {
            show: true,
            fontWeight: 500,
            label: 'Occupancy',
            fontSize: '1.125rem',
            color: 'var(--mui-palette-text-primary)',
            formatter: () => `${reportData.occupancy_stats.occupancy_rate.toFixed(1)}%`
          }
        }
      }
    },
    grid: {
      padding: {
        top: -25,
        bottom: -30
      }
    }
  }

  const occupancySeries = [reportData.occupancy_stats.occupancy_rate]

  // Top Tenants Bar Chart (exact pattern from ApexBarChart)
  const topTenantsOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: ['#00cfe8'],
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
        barHeight: '30%',
        horizontal: true
      }
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: false }
      },
      padding: {
        top: -10
      }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: 'var(--mui-palette-divider)' },
      categories: reportData.top_tenants.slice(0, 7).map(t => t.name),
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
        formatter: (val: string) => formatCurrency(parseFloat(val))
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrencyFull(val)
      }
    }
  }

  const topTenantsSeries = [{
    name: 'Total Paid',
    data: reportData.top_tenants.slice(0, 7).map(t => t.total_paid)
  }]

  // Overdue Analysis Line Chart (exact pattern from ApexLineChart)
  const overdueAnalysisOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    colors: ['#ff9f43'],
    stroke: { curve: 'straight' },
    dataLabels: { enabled: false },
    markers: {
      strokeWidth: 7,
      strokeOpacity: 1,
      colors: ['#ff9f43'],
      strokeColors: ['#fff']
    },
    grid: {
      padding: { top: -10 },
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      }
    },
    tooltip: {
      custom(data: any) {
        return `<div class='bar-chart'>
          <span>${formatCurrencyFull(data.series[data.seriesIndex][data.dataPointIndex])}</span>
        </div>`
      }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
        formatter: (val: number) => formatCurrency(val)
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: 'var(--mui-palette-divider)' },
      crosshairs: {
        stroke: { color: 'var(--mui-palette-divider)' }
      },
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
      },
      categories: ['0-7 Days', '8-30 Days', '31-60 Days', '60+ Days']
    }
  }

  const overdueAnalysisSeries = [{
    data: [
      reportData.overdue_analysis.by_days['0-7'],
      reportData.overdue_analysis.by_days['8-30'],
      reportData.overdue_analysis.by_days['31-60'],
      reportData.overdue_analysis.by_days['60+'],
    ]
  }]

  // Sales Overview Widget (exact pattern from Sales.tsx)
  const salesData = [
    {
      stats: reportData.tenant_insights.active_tenants.toString(),
      color: 'primary' as ThemeColor,
      title: 'Active Tenants',
      icon: 'ri-user-star-line'
    },
    {
      stats: formatCurrency(reportData.operational_alerts.overdue_amount),
      color: 'error' as ThemeColor,
      icon: 'ri-alarm-warning-line',
      title: 'Overdue Amount'
    },
    {
      color: 'info' as ThemeColor,
      stats: reportData.occupancy_stats.occupied_units.toString(),
      title: 'Occupied Units',
      icon: 'ri-building-line'
    }
  ]

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <div className='flex items-center justify-between'>
          <div>
            <Typography variant='h4' className='mbe-1'>
              Financial Reports & Analytics
            </Typography>
            <Typography>Comprehensive rental management insights and analytics</Typography>
          </div>
          <FormControl size='small' className='min-is-[150px]'>
            <InputLabel>Period</InputLabel>
            <Select value={period} label='Period' onChange={e => setPeriod(e.target.value)}>
              <MenuItem value='3months'>Last 3 Months</MenuItem>
              <MenuItem value='6months'>Last 6 Months</MenuItem>
              <MenuItem value='12months'>Last 12 Months</MenuItem>
              <MenuItem value='all'>All Time</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Grid>

      {/* Financial Overview Cards - Using HorizontalWithSubtitle */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={6}>
          {financialCards.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <HorizontalWithSubtitle {...item} />
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Rent Collection Trend - Area Chart */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Card>
          <CardHeader
            title='Rent Collection Trend'
            subheader='Monthly collected vs expected rent'
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              '& .MuiCardHeader-action': { mb: 0 },
              '& .MuiCardHeader-content': { mb: [2, 0] }
            }}
          />
          <CardContent>
            <AppReactApexCharts type='area' width='100%' height={400} options={collectionTrendOptions} series={collectionTrendSeries} />
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Status & Occupancy */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Payment Status' subheader='Invoice status breakdown' />
              <CardContent>
                <AppReactApexCharts type='donut' width='100%' height={300} options={paymentStatusOptions} series={paymentStatusSeries} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Occupancy Rate' />
              <CardContent>
                <AppReactApexCharts type='radialBar' width='100%' height={300} options={occupancyOptions} series={occupancySeries} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Sales Overview - Exact pattern from Sales.tsx */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Rentals Overview'
            action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
            subheader={
              <div className='flex items-center gap-2'>
                <span>Total {formatCurrency(reportData.financial_overview.total_collected)} Collected</span>
                <span className='flex items-center text-success font-medium'>
                  +{reportData.financial_overview.collection_rate.toFixed(1)}%
                  <i className='ri-arrow-up-s-line text-xl' />
                </span>
              </div>
            }
          />
          <CardContent>
            <div className='flex flex-wrap justify-between gap-4'>
              {salesData.map((item, index) => (
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
      </Grid>

      {/* Property Performance - Column Chart */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card>
          <CardHeader
            title='Property Performance'
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              '& .MuiCardHeader-action': { mb: 0 },
              '& .MuiCardHeader-content': { mb: [2, 0] }
            }}
          />
          <CardContent>
            <AppReactApexCharts type='bar' width='100%' height={400} options={propertyPerformanceOptions} series={propertyPerformanceSeries} />
          </CardContent>
        </Card>
      </Grid>

      {/* Top Tenants - Bar Chart */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card>
          <CardHeader
            title='Top Tenants by Payment'
            subheader='Highest paying tenants'
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              '& .MuiCardHeader-action': { mb: 0 },
              '& .MuiCardHeader-content': { mb: [2, 0] }
            }}
          />
          <CardContent>
            <AppReactApexCharts type='bar' width='100%' height={400} options={topTenantsOptions} series={topTenantsSeries} />
          </CardContent>
        </Card>
      </Grid>

      {/* Overdue Analysis - Line Chart */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Overdue Analysis'
            subheader='Overdue amounts by days overdue'
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              '& .MuiCardHeader-action': { mb: 0 },
              '& .MuiCardHeader-content': { mb: [2, 0] }
            }}
          />
          <CardContent>
            <AppReactApexCharts type='line' width='100%' height={400} options={overdueAnalysisOptions} series={overdueAnalysisSeries} />
          </CardContent>
        </Card>
      </Grid>

      {/* Bills & Expenses Section */}
      <Grid size={{ xs: 12 }}>
        <Divider className='mbs-4 mbe-4' />
        <Typography variant='h5' className='mbe-4'>
          Bills & Expenses
        </Typography>
      </Grid>

      {/* Bills Overview Cards */}
      {reportData.bills_data && (
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <HorizontalWithSubtitle
                title='Total Bills'
                stats={formatCurrency(reportData.bills_data.total_bills)}
                avatarIcon='ri-file-list-3-line'
                avatarColor='primary'
                trend='positive'
                trendNumber={`${reportData.bills_data.paid_count + reportData.bills_data.pending_count + reportData.bills_data.overdue_count} Bills`}
                subtitle='All Bills'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <HorizontalWithSubtitle
                title='Bills Paid'
                stats={formatCurrency(reportData.bills_data.total_paid)}
                avatarIcon='ri-checkbox-circle-line'
                avatarColor='success'
                trend='positive'
                trendNumber={`${reportData.bills_data.paid_count} Paid`}
                subtitle='Completed Payments'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <HorizontalWithSubtitle
                title='Outstanding Bills'
                stats={formatCurrency(reportData.bills_data.outstanding)}
                avatarIcon='ri-time-line'
                avatarColor='warning'
                trend='negative'
                trendNumber={`${reportData.bills_data.pending_count} Pending`}
                subtitle='Unpaid Bills'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <HorizontalWithSubtitle
                title='Overdue Bills'
                stats={formatCurrency(reportData.bills_data.overdue)}
                avatarIcon='ri-alarm-warning-line'
                avatarColor='error'
                trend='negative'
                trendNumber={`${reportData.bills_data.overdue_count} Overdue`}
                subtitle='Past Due'
              />
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Income vs Expenses - Stacked Column Chart */}
      {reportData.income_vs_expenses && (
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader
              title='Income vs Expenses'
              subheader={`Net Profit: ${formatCurrency(reportData.income_vs_expenses.net_profit)} (${reportData.income_vs_expenses.profit_margin.toFixed(1)}% margin)`}
              sx={{
                flexDirection: ['column', 'row'],
                alignItems: ['flex-start', 'center'],
                '& .MuiCardHeader-action': { mb: 0 },
                '& .MuiCardHeader-content': { mb: [2, 0] }
              }}
            />
            <CardContent>
              <AppReactApexCharts
                type='bar'
                width='100%'
                height={400}
                options={{
                  chart: {
                    parentHeightOffset: 0,
                    toolbar: { show: false },
                    stacked: true
                  },
                  colors: ['#00d4bd', '#ffa1a1'],
                  dataLabels: { enabled: false },
                  legend: {
                    position: 'top',
                    horizontalAlign: 'left',
                    fontSize: '13px',
                    labels: { colors: 'var(--mui-palette-text-secondary)' },
                    markers: {
                      offsetX: theme.direction === 'rtl' ? 7 : -4
                    }
                  },
                  grid: {
                    borderColor: 'var(--mui-palette-divider)',
                    xaxis: { lines: { show: true } }
                  },
                  yaxis: {
                    labels: {
                      style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
                      formatter: (val: number) => formatCurrency(val)
                    }
                  },
                  xaxis: {
                    axisBorder: { show: false },
                    axisTicks: { color: 'var(--mui-palette-divider)' },
                    labels: {
                      style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
                    },
                    categories: reportData.income_vs_expenses.monthly_data.map(d => d.month)
                  },
                  tooltip: {
                    y: {
                      formatter: (val: number) => formatCurrencyFull(val)
                    }
                  }
                }}
                series={[
                  {
                    name: 'Income',
                    data: reportData.income_vs_expenses.monthly_data.map(d => d.income)
                  },
                  {
                    name: 'Expenses',
                    data: reportData.income_vs_expenses.monthly_data.map(d => d.expenses)
                  }
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Expense Categories & Total Expenses */}
      {reportData.expense_categories && reportData.expenses_data && (
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title='Expense Categories'
                  subheader={`Total: ${formatCurrency(reportData.expenses_data.total_expenses)}`}
                />
                <CardContent>
                  <AppReactApexCharts
                    type='donut'
                    width='100%'
                    height={300}
                    options={{
                      stroke: { width: 0 },
                      labels: reportData.expense_categories.map(c => c.name),
                      colors: [donutColors.series1, donutColors.series2, donutColors.series3, donutColors.series4, donutColors.series5],
                      dataLabels: {
                        enabled: true,
                        formatter: (val: string) => `${parseInt(val, 10)}%`
                      },
                      legend: {
                        fontSize: '13px',
                        position: 'bottom',
                        markers: {
                          offsetX: theme.direction === 'rtl' ? 7 : -4
                        },
                        labels: { colors: 'var(--mui-palette-text-secondary)' },
                        itemMargin: { horizontal: 9 }
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            labels: {
                              show: true,
                              name: { fontSize: '1.2rem' },
                              value: {
                                fontSize: '1.2rem',
                                color: 'var(--mui-palette-text-secondary)',
                                formatter: (val: string) => formatCurrency(parseFloat(val))
                              },
                              total: {
                                show: true,
                                fontSize: '1.2rem',
                                label: 'Total Expenses',
                                formatter: () => formatCurrency(reportData.expenses_data.total_expenses),
                                color: 'var(--mui-palette-text-primary)'
                              }
                            }
                          }
                        }
                      }
                    }}
                    series={reportData.expense_categories.map(c => c.amount)}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Total Expenses' />
                <CardContent>
                  <div className='flex flex-col items-center justify-center p-6'>
                    <Typography variant='h3' color='error.main' className='mbe-2'>
                      {formatCurrency(reportData.expenses_data.total_expenses)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {reportData.expenses_data.count} Expenses Recorded
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Monthly Cash Flow - Line Chart */}
      {reportData.income_vs_expenses && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Monthly Cash Flow'
              subheader='Profit/Loss trend over time'
              sx={{
                flexDirection: ['column', 'row'],
                alignItems: ['flex-start', 'center'],
                '& .MuiCardHeader-action': { mb: 0 },
                '& .MuiCardHeader-content': { mb: [2, 0] }
              }}
            />
            <CardContent>
              <AppReactApexCharts
                type='line'
                width='100%'
                height={400}
                options={{
                  chart: {
                    parentHeightOffset: 0,
                    toolbar: { show: false }
                  },
                  colors: ['#00d4bd'],
                  stroke: { curve: 'smooth', width: 3 },
                  dataLabels: { enabled: false },
                  markers: {
                    size: 5,
                    strokeWidth: 3,
                    strokeColors: ['#00d4bd'],
                    fillColors: ['#fff']
                  },
                  grid: {
                    borderColor: 'var(--mui-palette-divider)',
                    xaxis: { lines: { show: true } }
                  },
                  yaxis: {
                    labels: {
                      style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
                      formatter: (val: number) => formatCurrency(val)
                    }
                  },
                  xaxis: {
                    axisBorder: { show: false },
                    axisTicks: { color: 'var(--mui-palette-divider)' },
                    labels: {
                      style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' }
                    },
                    categories: reportData.income_vs_expenses.monthly_data.map(d => d.month)
                  },
                  tooltip: {
                    y: {
                      formatter: (val: number) => formatCurrencyFull(val)
                    }
                  }
                }}
                series={[{
                  name: 'Net Profit',
                  data: reportData.income_vs_expenses.monthly_data.map(d => d.profit)
                }]}
              />
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default ReportsView
