// Component Imports
import PropertiesList from '@views/apps/rentals/properties/PropertiesList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const PropertiesListPage = async () => {
  const serverMode = await getServerMode()

  return <PropertiesList serverMode={serverMode} />
}

export default PropertiesListPage
