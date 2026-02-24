'use client'

import { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

type InvoiceItem = {
  id: number
  invoice_number: string
  due_date: string
  total_amount: number
  total_paid: number
  balance_due: number
  status: string
}

type PayData = {
  tenant: {
    id: number
    full_name: string
    email: string
    advance_balance: number
  }
  invoices: InvoiceItem[]
  total_balance_due: number
}

type Step = 'email' | 'amount' | 'waiting' | 'success' | 'failed'

type ApplicationSummary = {
  total_paid: number
  applied_to: { invoice_id: number; invoice_number: string; amount: number }[]
  advance_added: number
  remaining_balance_due: number
  advance_balance: number
}

export default function Pay() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [payData, setPayData] = useState<PayData | null>(null)
  const [amountMode, setAmountMode] = useState<'full' | 'custom'>('full')
  const [customAmount, setCustomAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [successDetails, setSuccessDetails] = useState<{ amount: number; application_summary?: ApplicationSummary } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  const fetchInvoices = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/pay/invoices?email=${encodeURIComponent(email)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'No tenant found for this email.')
      }
      const data: PayData = await res.json()
      setPayData(data)
      if (data.invoices.length === 0) {
        setError(null)
      } else {
        setStep('amount')
        setCustomAmount(String(data.total_balance_due))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices.')
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payData) return
    setError(null)
    setLoading(true)
    try {
      const amount =
        amountMode === 'full'
          ? selectedInvoiceId
            ? payData.invoices.find((i) => i.id === selectedInvoiceId)?.balance_due ?? payData.total_balance_due
            : payData.total_balance_due
          : parseFloat(customAmount)

      if (isNaN(amount) || amount < 500) {
        setError('Amount must be at least 500 UGX.')
        setLoading(false)
        return
      }

      const body: Record<string, unknown> = {
        email: payData.tenant.email,
        amount: Math.round(amount),
        phone: phone.trim(),
      }
      if (selectedInvoiceId && payData.invoices.length > 0) {
        body.invoice_id = selectedInvoiceId
        if (amountMode === 'full') body.pay_full = true
      } else if (amountMode === 'full') {
        body.pay_full = true
      }

      const res = await fetch(`${API_URL}/api/v1/pay/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Failed to initiate payment.')
      }
      setRequestId(data.requestId)
      setStep('waiting')
      setPollCount(0)
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (step !== 'waiting' || !requestId) return
    const interval = setInterval(async () => {
      setPollCount((c) => c + 1)
      try {
        const res = await fetch(`${API_URL}/api/v1/pay/status/${requestId}`)
        const data = await res.json().catch(() => ({}))
        const status = data.status as string
        if (status === 'Success') {
          setSuccessDetails({
            amount: data.amount ?? 0,
            application_summary: data.application_summary
          })
          setStep('success')
        } else if (status === 'Failed') setStep('failed')
      } catch {
        // keep polling
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [step, requestId])

  const reset = () => {
    setStep('email')
    setPayData(null)
    setRequestId(null)
    setSuccessDetails(null)
    setError(null)
    setAmountMode('full')
    setCustomAmount('')
    setPhone('')
    setSelectedInvoiceId(null)
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        Pay your rent
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Enter your email to see pending invoices and pay via mobile money.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 'email' && (!payData || payData.invoices.length > 0) && (
        <Card>
          <CardContent>
            <form onSubmit={fetchInvoices}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Find my invoices'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'amount' && payData && payData.invoices.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {payData.tenant.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total balance due: {payData.total_balance_due.toLocaleString()} UGX
            </Typography>
            <List dense sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              {payData.invoices.map((inv) => (
                <ListItem key={inv.id}>
                  <ListItemText
                    primary={inv.invoice_number}
                    secondary={`Due ${inv.due_date} · ${inv.balance_due.toLocaleString()} UGX`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Payment amount
              </Typography>
              <RadioGroup
                row
                value={amountMode}
                onChange={(_, v) => setAmountMode(v as 'full' | 'custom')}
              >
                <FormControlLabel value="full" control={<Radio />} label="Pay full balance" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom amount" />
              </RadioGroup>
            </FormControl>

            {amountMode === 'custom' && (
              <TextField
                fullWidth
                label="Amount (UGX)"
                type="number"
                inputProps={{ min: 500 }}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}

            {payData.invoices.length > 1 && amountMode === 'full' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Apply to invoice (optional)
                </Typography>
                <RadioGroup
                  value={selectedInvoiceId ?? ''}
                  onChange={(_, v) => setSelectedInvoiceId(v ? Number(v) : null)}
                >
                  <FormControlLabel value="" control={<Radio />} label="All invoices" />
                  {payData.invoices.map((inv) => (
                    <FormControlLabel
                      key={inv.id}
                      value={inv.id}
                      control={<Radio />}
                      label={`${inv.invoice_number} (${inv.balance_due.toLocaleString()} UGX)`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Mobile money phone number"
              placeholder="07XXXXXXXX or 2567XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <form onSubmit={initiatePayment}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="button" variant="outlined" onClick={() => setStep('email')} disabled={loading}>
                  Back
                </Button>
                <Button type="submit" variant="contained" disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={24} /> : 'Pay now'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'waiting' && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Check your phone</Typography>
            <Typography variant="body2" color="text.secondary">
              Approve the payment prompt on your mobile money app.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This may take a moment…
            </Typography>
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card>
          <CardContent sx={{ py: 4 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment successful. Thank you!
            </Alert>
            {successDetails && (
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Payment summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount paid: {((successDetails.application_summary?.total_paid ?? successDetails.amount) || 0).toLocaleString()} UGX
                </Typography>
                {successDetails.application_summary?.applied_to?.length ? (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Applied to invoices:
                    </Typography>
                    <List dense disablePadding>
                      {successDetails.application_summary.applied_to.map((a: { invoice_number: string; amount: number }) => (
                        <ListItem key={a.invoice_number} disablePadding sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={`${a.invoice_number}: ${a.amount.toLocaleString()} UGX`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : null}
                {successDetails.application_summary && (successDetails.application_summary.advance_added ?? 0) > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Added to advance: {successDetails.application_summary.advance_added.toLocaleString()} UGX
                  </Typography>
                )}
                {successDetails.application_summary && (successDetails.application_summary.remaining_balance_due ?? 0) > 0 && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontWeight: 500 }}>
                    Remaining balance due: {successDetails.application_summary.remaining_balance_due.toLocaleString()} UGX
                  </Typography>
                )}
                {successDetails.application_summary && (successDetails.application_summary.advance_balance ?? 0) > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Your advance balance: {successDetails.application_summary.advance_balance.toLocaleString()} UGX
                  </Typography>
                )}
              </Box>
            )}
            <Box sx={{ textAlign: 'center' }}>
              <Button variant="contained" onClick={reset}>
                Pay again
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {step === 'failed' && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Payment failed or was declined. Please try again.
            </Alert>
            <Button variant="contained" onClick={() => setStep('amount')}>
              Try again
            </Button>
            <Button variant="text" onClick={reset} sx={{ ml: 1 }}>
              Start over
            </Button>
          </CardContent>
        </Card>
      )}

      {payData && payData.invoices.length === 0 && step === 'email' && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No pending invoices. You can try another email.</Typography>
            <Button variant="text" onClick={reset} sx={{ mt: 1 }}>
              Try another email
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
