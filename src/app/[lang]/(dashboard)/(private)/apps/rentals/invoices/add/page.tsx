// Component Imports
import AddInvoice from '@views/apps/rentals/invoices/AddInvoice'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AddInvoicePage = async (props: { searchParams: Promise<{ tenant_id?: string; is_first?: string }> }) => {
  const serverMode = await getServerMode()
  const searchParams = await props.searchParams

  return (
    <AddInvoice 
      serverMode={serverMode} 
      tenantId={searchParams.tenant_id}
      isFirst={searchParams.is_first === 'true'}
    />
  )
}

export default AddInvoicePage
