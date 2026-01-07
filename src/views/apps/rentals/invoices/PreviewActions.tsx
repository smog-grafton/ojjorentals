// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import SendInvoiceDrawer from './SendInvoiceDrawer'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const PreviewActions = ({
  invoiceId,
  tenantEmail,
  onButtonClick,
  onDownloadPDF
}: {
  invoiceId: string
  tenantEmail?: string
  onButtonClick: () => void
  onDownloadPDF: () => void
}) => {
  // States
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)

  // Hooks
  const { lang: locale } = useParams()

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Button
            fullWidth
            variant='contained'
            className='capitalize'
            startIcon={<i className='ri-send-plane-line' />}
            onClick={() => setSendDrawerOpen(true)}
          >
            Send Invoice
          </Button>
          <Button
            fullWidth
            color='secondary'
            variant='outlined'
            className='capitalize'
            onClick={onDownloadPDF}
            startIcon={<i className='ri-download-line' />}
          >
            Download
          </Button>
          <div className='flex items-center gap-4'>
            <Button
              fullWidth
              color='secondary'
              variant='outlined'
              className='capitalize'
              onClick={onButtonClick}
              startIcon={<i className='ri-printer-line' />}
            >
              Print
            </Button>
            <Button
              fullWidth
              component={Link}
              color='secondary'
              variant='outlined'
              className='capitalize'
              href={getLocalizedUrl(`/apps/rentals/invoices/edit/${invoiceId}`, locale as Locale)}
              startIcon={<i className='ri-edit-line' />}
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
      <SendInvoiceDrawer
        open={sendDrawerOpen}
        handleClose={() => setSendDrawerOpen(false)}
        invoiceId={parseInt(invoiceId)}
        tenantEmail={tenantEmail}
      />
    </>
  )
}

export default PreviewActions
