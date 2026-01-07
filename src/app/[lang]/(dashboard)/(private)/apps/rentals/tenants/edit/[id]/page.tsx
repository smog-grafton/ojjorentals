// Component Imports
import EditTenant from '@views/apps/rentals/tenants/EditTenant'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const EditTenantPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <EditTenant tenantId={id} serverMode={serverMode} />
}

export default EditTenantPage
