// Component Imports
import InvoicesList from '@views/apps/rentals/invoices/InvoicesList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const InvoicesListPage = async () => {
  const serverMode = await getServerMode()

  return <InvoicesList serverMode={serverMode} />
}

export default InvoicesListPage
