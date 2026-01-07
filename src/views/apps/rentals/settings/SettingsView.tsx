'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { Mode } from '@core/types'

// Service Imports
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

// Third-party Imports
import { toast } from 'react-toastify'

const SettingsView = ({ serverMode }: { serverMode: Mode }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    company_name: '',
    company_phone: '',
    company_email: '',
    company_address: '',
    invoice_prefix: 'INV',
    receipt_prefix: 'RCT',
    default_due_days: 30,
    penalty_percentage: 0,
    mail_host: '',
    mail_port: 465,
    mail_username: '',
    mail_password: '',
    mail_encryption: 'ssl',
    mail_from_address: '',
    mail_from_name: '',
    logo_path: '',
    favicon_path: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [faviconPreview, setFaviconPreview] = useState<string>('')
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        if (response.data) {
          // Normalize data to ensure all string fields are strings (not null/undefined)
          setSettings({
            company_name: response.data.company_name || '',
            company_phone: response.data.company_phone || '',
            company_email: response.data.company_email || '',
            company_address: response.data.company_address || '',
            invoice_prefix: response.data.invoice_prefix || 'INV',
            receipt_prefix: response.data.receipt_prefix || 'RCT',
            default_due_days: response.data.default_due_days ?? 30,
            penalty_percentage: response.data.penalty_percentage ?? 0,
            mail_host: response.data.mail_host || '',
            mail_port: response.data.mail_port ?? 465,
            mail_username: response.data.mail_username || '',
            mail_password: response.data.mail_password || '',
            mail_encryption: response.data.mail_encryption || 'ssl',
            mail_from_address: response.data.mail_from_address || '',
            mail_from_name: response.data.mail_from_name || '',
            logo_path: response.data.logo_path || '',
            favicon_path: response.data.favicon_path || ''
          })
          // Set preview URLs if logo/favicon exist
          if (response.data.logo_path) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
            setLogoPreview(`${apiUrl}/storage/${response.data.logo_path}`)
          }
          if (response.data.favicon_path) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
            setFaviconPreview(`${apiUrl}/storage/${response.data.favicon_path}`)
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      
      // Add all settings fields
      Object.keys(settings).forEach(key => {
        if (settings[key as keyof typeof settings] !== null && settings[key as keyof typeof settings] !== undefined) {
          formData.append(key, String(settings[key as keyof typeof settings]))
        }
      })
      
      // Add logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile)
      }
      
      // Add favicon file if selected
      if (faviconFile) {
        formData.append('favicon', faviconFile)
      }
      
      await api.post('/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setSuccess(true)
      toast.success('Settings saved successfully!')
      setTimeout(() => setSuccess(false), 3000)
      // Refresh settings to get updated paths
      const response = await api.get('/settings')
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          logo_path: response.data.logo_path || '',
          favicon_path: response.data.favicon_path || ''
        }))
        if (response.data.logo_path) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
          setLogoPreview(`${apiUrl}/storage/${response.data.logo_path}`)
        }
        if (response.data.favicon_path) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
          setFaviconPreview(`${apiUrl}/storage/${response.data.favicon_path}`)
        }
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save settings'
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTestSmtp = async () => {
    setTestingSmtp(true)
    setSmtpTestResult(null)

    try {
      const response = await api.post('/settings/test-smtp')
      setSmtpTestResult({ success: true, message: response.data.message || 'SMTP connection successful!' })
      toast.success('SMTP test successful!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'SMTP test failed'
      setSmtpTestResult({ success: false, message: errorMessage })
      toast.error(errorMessage)
    } finally {
      setTestingSmtp(false)
    }
  }

  // Only admin can access settings
  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardHeader title='Settings' />
        <CardContent>
          <Alert severity='error'>You do not have permission to access this page.</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='System Settings' />
      <Divider />
      <CardContent>
        {success && (
          <Alert severity='success' className='mbe-4'>
            Settings saved successfully!
          </Alert>
        )}
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' className='mbe-2'>
                Company Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Company Name'
                required
                value={settings.company_name}
                onChange={e => setSettings({ ...settings, company_name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Company Phone'
                required
                value={settings.company_phone}
                onChange={e => setSettings({ ...settings, company_phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Company Email'
                type='email'
                value={settings.company_email}
                onChange={e => setSettings({ ...settings, company_email: e.target.value })}
                placeholder='vincentk07@gmail.com'
                helperText='Email to display on invoices and receipts'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Company Address'
                multiline
                rows={3}
                required
                value={settings.company_address}
                onChange={e => setSettings({ ...settings, company_address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-2 mbe-4' />
              <Typography variant='subtitle2' className='mbe-2'>
                Invoice & Receipt Settings
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Invoice Prefix'
                value={settings.invoice_prefix}
                onChange={e => setSettings({ ...settings, invoice_prefix: e.target.value })}
                helperText='Prefix for invoice numbers (e.g., INV)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Receipt Prefix'
                value={settings.receipt_prefix}
                onChange={e => setSettings({ ...settings, receipt_prefix: e.target.value })}
                helperText='Prefix for receipt numbers (e.g., RCT)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Default Due Days'
                value={settings.default_due_days}
                onChange={e =>
                  setSettings({ ...settings, default_due_days: parseInt(e.target.value) || 30 })
                }
                helperText='Default number of days before invoice is due'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Penalty Percentage'
                value={settings.penalty_percentage}
                onChange={e =>
                  setSettings({ ...settings, penalty_percentage: parseFloat(e.target.value) || 0 })
                }
                helperText='Late payment penalty percentage'
                InputProps={{
                  endAdornment: <span className='mle-2'>%</span>
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-2 mbe-4' />
              <Typography variant='subtitle2' className='mbe-2'>
                SMTP Email Settings
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mbe-4'>
                Configure SMTP settings to enable email sending for invoices, receipts, and reminders.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Mail Host'
                value={settings.mail_host}
                onChange={e => setSettings({ ...settings, mail_host: e.target.value })}
                placeholder='smtp.hostinger.com'
                helperText='SMTP server hostname'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Mail Port'
                value={settings.mail_port}
                onChange={e => setSettings({ ...settings, mail_port: parseInt(e.target.value) || 465 })}
                helperText='SMTP port (usually 465 for SSL, 587 for TLS)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Mail Username'
                type='email'
                value={settings.mail_username}
                onChange={e => setSettings({ ...settings, mail_username: e.target.value })}
                placeholder='your-email@domain.com'
                helperText='SMTP username (usually your email address)'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Mail Password'
                type='password'
                value={settings.mail_password}
                onChange={e => setSettings({ ...settings, mail_password: e.target.value })}
                helperText='SMTP password'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label='Mail Encryption'
                value={settings.mail_encryption}
                onChange={e => setSettings({ ...settings, mail_encryption: e.target.value })}
                SelectProps={{
                  native: false
                }}
              >
                <MenuItem value='ssl'>SSL</MenuItem>
                <MenuItem value='tls'>TLS</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='From Address'
                type='email'
                value={settings.mail_from_address}
                onChange={e => setSettings({ ...settings, mail_from_address: e.target.value })}
                placeholder='noreply@yourdomain.com'
                helperText='Email address to send from'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='From Name'
                value={settings.mail_from_name}
                onChange={e => setSettings({ ...settings, mail_from_name: e.target.value })}
                placeholder='Vinkyaba Rentals'
                helperText='Display name for sent emails'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-2 mbe-4' />
              <Typography variant='subtitle2' className='mbe-2'>
                Branding (Logo & Favicon)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='body2' className='mbe-2'>
                Company Logo
              </Typography>
              {logoPreview && (
                <div className='mbe-2'>
                  <img src={logoPreview} alt='Logo preview' style={{ maxWidth: '200px', maxHeight: '100px' }} />
                </div>
              )}
              <Button variant='outlined' component='label' fullWidth>
                {logoFile ? 'Change Logo' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                <input type='file' hidden accept='image/*' onChange={handleLogoChange} />
              </Button>
              <Typography variant='caption' color='text.secondary' className='mts-1'>
                Recommended: PNG or SVG, max 2MB
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='body2' className='mbe-2'>
                Favicon
              </Typography>
              {faviconPreview && (
                <div className='mbe-2'>
                  <img src={faviconPreview} alt='Favicon preview' style={{ maxWidth: '32px', maxHeight: '32px' }} />
                </div>
              )}
              <Button variant='outlined' component='label' fullWidth>
                {faviconFile ? 'Change Favicon' : faviconPreview ? 'Change Favicon' : 'Upload Favicon'}
                <input type='file' hidden accept='image/*,.ico' onChange={handleFaviconChange} />
              </Button>
              <Typography variant='caption' color='text.secondary' className='mts-1'>
                Recommended: ICO or PNG, 32x32px, max 512KB
              </Typography>
            </Grid>
            {smtpTestResult && (
              <Grid size={{ xs: 12 }}>
                <Alert severity={smtpTestResult.success ? 'success' : 'error'}>
                  {smtpTestResult.message}
                </Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <Divider className='mbs-4' />
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                  type='button'
                  variant='outlined'
                  onClick={handleTestSmtp}
                  disabled={testingSmtp || !settings.mail_host}
                  startIcon={<i className='ri-mail-send-line' />}
                >
                  {testingSmtp ? 'Testing...' : 'Test SMTP Connection'}
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default SettingsView
