// Component Imports
import TenantDetails from '@views/apps/rentals/tenants/TenantDetails'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const TenantDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <TenantDetails tenantId={id} serverMode={serverMode} />
}

export default TenantDetailsPage
