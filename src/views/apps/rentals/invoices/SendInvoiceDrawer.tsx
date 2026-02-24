// React Imports
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Service Imports
import api from '@/services/api'

// Third-party Imports
import { toast } from 'react-toastify'

type Props = {
  open: boolean
  handleClose: () => void
  invoiceId: number
  tenantEmail?: string
}

type FormDataType = {
  to: string
  subject: string
  message: string
}

const SendInvoiceDrawer = ({ open, handleClose, invoiceId, tenantEmail }: Props) => {
  // States
  const [formData, setFormData] = useState<FormDataType>({
    to: tenantEmail || '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (open && tenantEmail) {
      setFormData(prev => ({ ...prev, to: tenantEmail }))
    }
  }, [open, tenantEmail])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        setSettings(response.data)
        if (response.data && !formData.subject) {
          setFormData(prev => ({
            ...prev,
            subject: `Invoice - ${response.data.company_name || 'Ojjo Properties'}`,
            message: `Dear Tenant,

Please find attached your invoice for review and payment.

Thank you for your business!

Best regards,
${response.data.company_name || 'Ojjo Properties'}`
          }))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    if (open) {
      fetchSettings()
    }
  }, [open])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post(`/invoices/${invoiceId}/send-email`, {
        to: formData.to,
        subject: formData.subject,
        message: formData.message
      })
      toast.success('Invoice sent successfully!')
      handleClose()
      setFormData({
        to: tenantEmail || '',
        subject: '',
        message: ''
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send invoice'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    setFormData({
      to: tenantEmail || '',
      subject: '',
      message: ''
    })
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Send Invoice</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col items-start gap-5'>
          <TextField
            fullWidth
            label='To'
            type='email'
            required
            variant='outlined'
            value={formData.to}
            onChange={e => setFormData({ ...formData, to: e.target.value })}
          />
          <TextField
            fullWidth
            label='Subject'
            variant='outlined'
            required
            value={formData.subject}
            onChange={e => setFormData({ ...formData, subject: e.target.value })}
          />
          <TextField
            fullWidth
            label='Message'
            variant='outlined'
            multiline
            rows={10}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
          />
          <Chip
            size='small'
            color='primary'
            variant='tonal'
            className='rounded-md'
            label='Invoice PDF Attached'
            icon={<i className='ri-attachment-line' />}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
            <Button variant='outlined' color='secondary' type='button' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default SendInvoiceDrawer
