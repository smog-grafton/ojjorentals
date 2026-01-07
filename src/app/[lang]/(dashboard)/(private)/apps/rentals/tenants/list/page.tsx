// Component Imports
import TenantsList from '@views/apps/rentals/tenants/TenantsList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const TenantsListPage = async () => {
  const serverMode = await getServerMode()

  return <TenantsList serverMode={serverMode} />
}

export default TenantsListPage
