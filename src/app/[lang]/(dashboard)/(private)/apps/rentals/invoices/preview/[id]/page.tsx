// Component Imports
import InvoicePreview from '@views/apps/rentals/invoices/InvoicePreview'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const InvoicePreviewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <InvoicePreview invoiceId={id} serverMode={serverMode} />
}

export default InvoicePreviewPage
