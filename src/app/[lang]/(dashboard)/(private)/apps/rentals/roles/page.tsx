// Component Imports
import RolesView from '@views/apps/rentals/roles/RolesView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const RolesPage = async () => {
  const serverMode = await getServerMode()

  return <RolesView serverMode={serverMode} />
}

export default RolesPage
