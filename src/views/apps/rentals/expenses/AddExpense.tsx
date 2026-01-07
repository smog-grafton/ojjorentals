'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useRouter } from 'next/navigation'

// Component Imports
import SearchableSelect from '@/components/rentals/SearchableSelect'
import AddExpenseCategory from '@components/dialogs/add-expense-category'

// Third-party Imports
import { toast } from 'react-toastify'

const AddExpense = ({ serverMode }: { serverMode: Mode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    property_id: '',
    unit_id: '',
    expense_category_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference: '',
    attachment: null as File | null
  })

  const fetchCategories = async () => {
    try {
      const response = await api.get('/expense-categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCategoryAdded = (category: any) => {
    setCategories(prev => [...prev, category])
    setFormData(prev => ({ ...prev, expense_category_id: String(category.id) }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachment: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = new FormData()
      payload.append('property_id', formData.property_id || '')
      payload.append('unit_id', formData.unit_id || '')
      payload.append('expense_category_id', formData.expense_category_id)
      payload.append('amount', formData.amount)
      payload.append('description', formData.description)
      payload.append('expense_date', formData.expense_date)
      payload.append('payment_method', formData.payment_method)
      payload.append('reference', formData.reference || '')
      if (formData.attachment) {
        payload.append('attachment', formData.attachment)
      }

      await api.post('/expenses', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Expense created successfully!')
      router.push('/en/apps/rentals/expenses/list')
    } catch (error: any) {
      console.error('Error creating expense:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create expense'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Add Expense' />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchableSelect
                label='Property'
                value={formData.property_id ? Number(formData.property_id) : null}
                onChange={(value) => setFormData(prev => ({ ...prev, property_id: value ? String(value) : '', unit_id: '' }))}
                endpoint='/properties'
                getOptionLabel={(option) => `${option.name} - ${option.location}`}
                getOptionValue={(option) => option.id}
                placeholder='Select property (optional)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchableSelect
                label='Unit'
                value={formData.unit_id ? Number(formData.unit_id) : null}
                onChange={(value) => setFormData(prev => ({ ...prev, unit_id: value ? String(value) : '' }))}
                endpoint='/units'
                getOptionLabel={(option) => `${option.unit_number} - ${option.property?.name || 'N/A'}`}
                getOptionValue={(option) => option.id}
                filterParams={formData.property_id ? { property_id: formData.property_id } : {}}
                placeholder='Select unit (optional)'
                disabled={!formData.property_id}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <div className='flex items-start gap-2'>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.expense_category_id}
                    label='Category'
                    onChange={(e) => setFormData(prev => ({ ...prev, expense_category_id: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setCategoryDialogOpen(true)}
                  className='mts-4'
                  color='primary'
                  title='Add New Category'
                >
                  <i className='ri-add-line' />
                </IconButton>
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Amount'
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography className='mre-2'>UGX</Typography>
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Description'
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Expense description'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Expense Date'
                required
                value={formData.expense_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment_method}
                  label='Payment Method'
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                >
                  <MenuItem value='cash'>Cash</MenuItem>
                  <MenuItem value='bank'>Bank</MenuItem>
                  <MenuItem value='mobile_money'>Mobile Money</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Reference'
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder='Payment reference (optional)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Button
                variant='outlined'
                component='label'
                fullWidth
                startIcon={<i className='ri-upload-line' />}
              >
                {formData.attachment ? formData.attachment.name : 'Upload Receipt/Attachment'}
                <input
                  type='file'
                  hidden
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={handleFileChange}
                />
              </Button>
              {formData.attachment && (
                <Typography variant='caption' className='mts-2 block'>
                  Selected: {formData.attachment.name}
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Creating...' : 'Create Expense'}
                </Button>
                <Button variant='outlined' onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <AddExpenseCategory
        open={categoryDialogOpen}
        setOpen={setCategoryDialogOpen}
        onCategoryAdded={handleCategoryAdded}
      />
    </Card>
  )
}

export default AddExpense
