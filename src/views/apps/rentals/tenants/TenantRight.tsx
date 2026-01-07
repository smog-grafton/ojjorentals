'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import TenantOverviewTab from './TenantOverviewTab'
import TenantBillingTab from './TenantBillingTab'
import TenantNotificationsTab from './TenantNotificationsTab'
import TenantSecurityTab from './TenantSecurityTab'

interface Tenant {
  id: number
  full_name: string
  email: string | null
  phone: string
  national_id: string | null
  unit: {
    id: number
    unit_number: string
    monthly_rent: number
    property: {
      name: string
      location: string
    }
  }
  status: string
  rent_start_date: string
  invoices: Array<{
    id: number
    invoice_number: string
    total_amount: number
    due_date: string
    status: string
    security_deposit: number
  }>
  payments: Array<{
    id: number
    amount: number
    payment_method: string
    payment_date: string
    invoice: {
      invoice_number: string
    }
  }>
  reminders?: Array<{
    id: number
    type: string
    status: string
    created_at: string
    invoice?: {
      invoice_number: string
    }
  }>
  security_deposit_paid?: boolean
}

const TenantRight = ({ tenant }: { tenant: Tenant }) => {
  // States
  const [activeTab, setActiveTab] = useState('overview')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const tabContentList: { [key: string]: ReactElement } = {
    overview: <TenantOverviewTab tenant={tenant} />,
    billing: <TenantBillingTab tenant={tenant} />,
    notifications: <TenantNotificationsTab tenant={tenant} />,
    security: <TenantSecurityTab tenant={tenant} />
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='ri-dashboard-line' />} value='overview' label='Overview' iconPosition='start' />
            <Tab icon={<i className='ri-bill-line' />} value='billing' label='Billing' iconPosition='start' />
            <Tab
              icon={<i className='ri-notification-4-line' />}
              value='notifications'
              label='Notifications'
              iconPosition='start'
            />
            <Tab icon={<i className='ri-shield-check-line' />} value='security' label='Security' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default TenantRight
