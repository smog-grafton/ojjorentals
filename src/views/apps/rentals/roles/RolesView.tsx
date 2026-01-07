'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

interface RoleStats {
  role: string
  count: number
}

const RolesView = ({ serverMode }: { serverMode: Mode }) => {
  const [roleStats, setRoleStats] = useState<RoleStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/users')
        const users = response.data || []
        
        // Calculate role statistics
        const stats: { [key: string]: number } = {}
        users.forEach((user: any) => {
          stats[user.role] = (stats[user.role] || 0) + 1
        })
        
        const roleStatsArray: RoleStats[] = Object.entries(stats).map(([role, count]) => ({
          role,
          count: count as number,
        }))
        
        setRoleStats(roleStatsArray)
      } catch (error) {
        console.error('Error fetching role data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'primary' : 'secondary'
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? 'ri-shield-user-line' : 'ri-user-line'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='Roles & Permissions' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div>
          <Typography variant='h4' className='mbe-1'>
            Roles & Permissions
          </Typography>
          <Typography>
            Manage user roles and their access permissions. Roles define what features and menus users can access.
          </Typography>
        </div>
      </Grid>

      {roleStats.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={stat.role}>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <Typography className='grow'>
                  Total {stat.count} {stat.count === 1 ? 'user' : 'users'}
                </Typography>
                <CustomAvatar
                  variant='rounded'
                  skin='light'
                  color={getRoleColor(stat.role) as any}
                  size={40}
                >
                  <i className={getRoleIcon(stat.role)} />
                </CustomAvatar>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex flex-col items-start gap-1'>
                  <Typography variant='h5' className='capitalize'>
                    {stat.role}
                  </Typography>
                  <Chip
                    label={stat.role === 'admin' ? 'Full Access' : 'Limited Access'}
                    size='small'
                    color={getRoleColor(stat.role) as any}
                    variant='tonal'
                  />
                </div>
                <IconButton>
                  <i className='ri-file-copy-line text-secondary' />
                </IconButton>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Role Permissions' />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' className='mbe-2'>
                  Admin Role
                </Typography>
                <Typography variant='body2' color='text.secondary' className='mbe-4'>
                  Administrators have full access to all features and can manage all aspects of the system.
                </Typography>
                <div className='flex flex-col gap-2'>
                  {[
                    'View all tenants, units, and properties',
                    'Create and manage invoices',
                    'Record payments and generate receipts',
                    'Manage reminders and notifications',
                    'View all reports and analytics',
                    'Manage system settings',
                    'Manage users and roles',
                  ].map((permission, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <i className='ri-check-line text-success' />
                      <Typography variant='body2'>{permission}</Typography>
                    </div>
                  ))}
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' className='mbe-2'>
                  Staff Role
                </Typography>
                <Typography variant='body2' color='text.secondary' className='mbe-4'>
                  Staff members have limited access and can perform day-to-day operations.
                </Typography>
                <div className='flex flex-col gap-2'>
                  {[
                    'View tenants, units, and properties',
                    'Create invoices',
                    'Record payments',
                    'View reminders',
                    'View basic reports',
                  ].map((permission, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <i className='ri-check-line text-success' />
                      <Typography variant='body2'>{permission}</Typography>
                    </div>
                  ))}
                  <div className='flex items-center gap-2 mts-2'>
                    <i className='ri-close-line text-error' />
                    <Typography variant='body2' color='text.secondary'>
                      Cannot manage settings or users
                    </Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default RolesView
