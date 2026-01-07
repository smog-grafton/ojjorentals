'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { toast } from 'react-toastify'

type Props = {
  open: boolean
  handleClose: () => void
  onAdd: (userData: any) => Promise<void>
}

const AddUserDrawer = ({ open, handleClose, onAdd }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onAdd(formData)
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        status: 'active'
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add user'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: 300, sm: 400 } }
      }}
    >
      <div className='flex items-center justify-between pli-6 plb-5 border-be'>
        <Typography variant='h5'>Add New User</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <div className='p-6'>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Full Name'
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='email'
                label='Email'
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Phone'
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='password'
                label='Password'
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                helperText='Minimum 8 characters'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  label='Role'
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value='admin'>Admin</MenuItem>
                  <MenuItem value='staff'>Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='inactive'>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4 mbe-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Adding...' : 'Add User'}
                </Button>
                <Button variant='outlined' onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
