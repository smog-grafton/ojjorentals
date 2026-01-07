'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Third-party Imports
import { toast } from 'react-toastify'

interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'staff'
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

const UserView = ({ userId, serverMode }: { userId: string; serverMode: Mode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff' as 'admin' | 'staff',
    status: 'active' as 'active' | 'inactive',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/users/${userId}`)
        setUser(response.data)
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          role: response.data.role,
          status: response.data.status,
        })
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await api.put(`/users/${userId}`, formData)
      setUser(response.data)
      setEditing(false)
      toast.success('User updated successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='User Details' />
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader title='User Details' />
        <CardContent>
          <Alert severity='error'>User not found</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex items-center justify-between'>
          <Typography variant='h4'>User Details</Typography>
          <div className='flex items-center gap-4'>
            {editing ? (
              <>
                <Button variant='outlined' onClick={() => {
                  setEditing(false)
                  setFormData({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    role: user.role,
                    status: user.status,
                  })
                }}>
                  Cancel
                </Button>
                <Button variant='contained' onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button variant='contained' onClick={() => setEditing(true)}>
                Edit User
              </Button>
            )}
          </div>
        </div>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent className='flex flex-col items-center gap-4 pbs-12'>
            <CustomAvatar
              src={`/images/avatars/${(user.id % 8) + 1}.png`}
              size={120}
              variant='rounded'
              className='rounded-lg'
            >
              {user.name.charAt(0).toUpperCase()}
            </CustomAvatar>
            <div className='text-center'>
              <Typography variant='h5'>{user.name}</Typography>
              <Typography variant='body2' color='text.secondary' className='mts-1'>
                {user.email}
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Chip
                label={user.role}
                color={user.role === 'admin' ? 'primary' : 'secondary'}
                variant='tonal'
                className='capitalize'
              />
              <Chip
                label={user.status}
                color={user.status === 'active' ? 'success' : 'default'}
                variant='tonal'
                className='capitalize'
              />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardHeader title='User Information' />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Full Name'
                  value={editing ? formData.name : user.name}
                  onChange={editing ? e => setFormData({ ...formData, name: e.target.value }) : undefined}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type='email'
                  label='Email'
                  value={editing ? formData.email : user.email}
                  onChange={editing ? e => setFormData({ ...formData, email: e.target.value }) : undefined}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Phone'
                  value={editing ? formData.phone : (user.phone || 'N/A')}
                  onChange={editing ? e => setFormData({ ...formData, phone: e.target.value }) : undefined}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label='Role'
                    value={editing ? formData.role : user.role}
                    onChange={editing ? e => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' }) : undefined}
                  >
                    <MenuItem value='admin'>Admin</MenuItem>
                    <MenuItem value='staff'>Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label='Status'
                    value={editing ? formData.status : user.status}
                    onChange={editing ? e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' }) : undefined}
                  >
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Created At'
                  value={new Date(user.created_at).toLocaleString()}
                  disabled
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserView
