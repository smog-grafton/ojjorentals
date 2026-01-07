// Component Imports
import UnitsList from '@views/apps/rentals/units/UnitsList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const UnitsListPage = async () => {
  const serverMode = await getServerMode()

  return <UnitsList serverMode={serverMode} />
}

export default UnitsListPage
