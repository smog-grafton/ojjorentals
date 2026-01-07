// Component Imports
import AddUnit from '@views/apps/rentals/units/AddUnit'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AddUnitPage = async () => {
  const serverMode = await getServerMode()

  return <AddUnit serverMode={serverMode} />
}

export default AddUnitPage
