// Component Imports
import AddTenant from '@views/apps/rentals/tenants/AddTenant'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AddTenantPage = async () => {
  const serverMode = await getServerMode()

  return <AddTenant serverMode={serverMode} />
}

export default AddTenantPage
