// Component Imports
import EditInvoice from '@views/apps/rentals/invoices/EditInvoice'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const EditInvoicePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <EditInvoice invoiceId={id} serverMode={serverMode} />
}

export default EditInvoicePage
