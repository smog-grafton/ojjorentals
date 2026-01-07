// Component Imports
import InvoiceDetails from '@views/apps/rentals/invoices/InvoiceDetails'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const InvoiceDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <InvoiceDetails invoiceId={id} serverMode={serverMode} />
}

export default InvoiceDetailsPage
