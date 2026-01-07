'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'

// Third-party Imports
import classnames from 'classnames'
import { formatDistanceToNow, format } from 'date-fns'

// Type Imports
import type { Mode } from '@core/types'
import type { ThemeColor } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'
import { useNotifications, type Notification } from '@/hooks/useNotifications'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const NotificationsView = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refresh } = useNotifications()
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (typeFilter !== 'all' && notif.type !== typeFilter) return false
      if (readFilter === 'read' && !notif.read_at) return false
      if (readFilter === 'unread' && notif.read_at) return false
      return true
    })
  }, [notifications, typeFilter, readFilter])

  // Paginated notifications
  const paginatedNotifications = useMemo(() => {
    const start = page * rowsPerPage
    return filteredNotifications.slice(start, start + rowsPerPage)
  }, [filteredNotifications, page, rowsPerPage])

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id)
    }
    if (notification.data.action_url) {
      router.push(notification.data.action_url)
    }
  }

  const getAvatar = (notification: Notification) => {
    const data = notification.data
    if (data.avatar_image) {
      return <CustomAvatar src={data.avatar_image} />
    } else if (data.avatar_icon) {
      return (
        <CustomAvatar color={data.avatar_color as ThemeColor} skin='light'>
          <i className={data.avatar_icon} />
        </CustomAvatar>
      )
    } else if (data.avatar_text) {
      return (
        <CustomAvatar color={data.avatar_color as ThemeColor} skin='light'>
          {data.avatar_text}
        </CustomAvatar>
      )
    } else {
      return (
        <CustomAvatar color='primary' skin='light'>
          <i className='ri-notification-line' />
        </CustomAvatar>
      )
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, 'MMM d, yyyy h:mm a')
    }
  }

  return (
    <Card>
      <CardHeader
        title='Notifications'
        action={
          <div className='flex items-center gap-4'>
            {unreadCount > 0 && (
              <Button
                variant='outlined'
                size='small'
                onClick={async () => {
                  await markAllAsRead()
                  refresh()
                }}
              >
                Mark All as Read
              </Button>
            )}
            <Button
              variant='contained'
              size='small'
              onClick={async () => {
                // Trigger reminder generation
                await api.post('/reminders/generate-all')
                refresh()
              }}
            >
              Refresh Reminders
            </Button>
          </div>
        }
      />
      <Divider />
      <div className='flex flex-wrap items-center justify-between gap-4 p-6 border-t'>
        <TextField
          size='small'
          placeholder='Search notifications...'
          className='is-full sm:is-auto'
          InputProps={{
            startAdornment: <i className='ri-search-line text-xl' />
          }}
        />
        <div className='flex items-center gap-4'>
          <FormControl size='small' className='min-is-[150px]'>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label='Type' onChange={e => setTypeFilter(e.target.value)}>
              <MenuItem value='all'>All Types</MenuItem>
              <MenuItem value='reminder'>Reminders</MenuItem>
              <MenuItem value='payment'>Payments</MenuItem>
              <MenuItem value='invoice'>Invoices</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small' className='min-is-[150px]'>
            <InputLabel>Status</InputLabel>
            <Select value={readFilter} label='Status' onChange={e => setReadFilter(e.target.value)}>
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='unread'>Unread</MenuItem>
              <MenuItem value='read'>Read</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      <Divider />
      {paginatedNotifications.length === 0 ? (
        <div className='p-6 text-center'>
          <Typography color='text.secondary'>No notifications found</Typography>
        </div>
      ) : (
        <>
          <List className='p-0'>
            {paginatedNotifications.map((notification, index) => {
              const data = notification.data
              const isUnread = !notification.read_at
              
              return (
                <div key={notification.id}>
                  <ListItem
                    className={classnames('cursor-pointer hover:bg-actionHover plb-4 pli-6', {
                      'bg-actionHover': isUnread
                    })}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant='dot'
                        color='primary'
                        invisible={!isUnread}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        {getAvatar(notification)}
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <div className='flex items-center gap-2'>
                          <Typography variant='body2' className='font-medium' color='text.primary'>
                            {data.title}
                          </Typography>
                          {isUnread && (
                            <Chip label='New' size='small' color='primary' variant='tonal' />
                          )}
                          <Chip
                            label={notification.type}
                            size='small'
                            color={data.avatar_color as ThemeColor}
                            variant='outlined'
                            className='capitalize'
                          />
                        </div>
                      }
                      secondary={
                        <div className='flex flex-col gap-1 mts-1'>
                          <Typography variant='caption' color='text.secondary'>
                            {data.subtitle}
                          </Typography>
                          <Typography variant='caption' color='text.disabled'>
                            {formatTime(notification.created_at)}
                          </Typography>
                        </div>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <IconButton
                      size='small'
                      onClick={async (e) => {
                        e.stopPropagation()
                        await deleteNotification(notification.id)
                        refresh()
                      }}
                      className='text-textSecondary'
                    >
                      <i className='ri-close-line' />
                    </IconButton>
                  </ListItem>
                  {index < paginatedNotifications.length - 1 && <Divider />}
                </div>
              )
            })}
          </List>
          <Divider />
          <TablePagination
            component='div'
            count={filteredNotifications.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => {
              setRowsPerPage(Number(e.target.value))
              setPage(0)
            }}
          />
        </>
      )}
    </Card>
  )
}

export default NotificationsView
