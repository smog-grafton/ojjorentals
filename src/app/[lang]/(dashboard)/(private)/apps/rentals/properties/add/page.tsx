// Component Imports
import AddProperty from '@views/apps/rentals/properties/AddProperty'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AddPropertyPage = async () => {
  const serverMode = await getServerMode()

  return <AddProperty serverMode={serverMode} />
}

export default AddPropertyPage
