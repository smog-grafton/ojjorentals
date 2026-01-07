// Component Imports
import EditProperty from '@views/apps/rentals/properties/EditProperty'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const EditPropertyPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <EditProperty propertyId={id} serverMode={serverMode} />
}

export default EditPropertyPage
