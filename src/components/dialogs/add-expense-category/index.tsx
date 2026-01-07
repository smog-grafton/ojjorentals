'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Service Imports
import api from '@/services/api'

// Third-party Imports
import { toast } from 'react-toastify'

type AddExpenseCategoryProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onCategoryAdded?: (category: any) => void
}

const AddExpenseCategory = ({ open, setOpen, onCategoryAdded }: AddExpenseCategoryProps) => {
  // States
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleClose = () => {
    setOpen(false)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/expense-categories', formData)
      toast.success('Expense category created successfully!')
      if (onCategoryAdded) {
        onCategoryAdded(response.data)
      }
      handleClose()
    } catch (error: any) {
      console.error('Error creating expense category:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create expense category'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
      open={open}
      onClose={handleClose}
      scroll='body'
      closeAfterTransition={false}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Add Expense Category
        <Typography component='span' className='flex flex-col text-center'>
          Create a new expense category
        </Typography>
      </DialogTitle>
      <DialogContent className='pbs-0 sm:pli-16 sm:pbe-16'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <TextField
            fullWidth
            label='Category Name'
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder='e.g., Maintenance, Utilities, Salaries'
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder='Optional description for this category'
          />
          <DialogActions className='gap-2 p-0'>
            <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddExpenseCategory
