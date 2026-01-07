// Component Imports
import PropertyDetails from '@views/apps/rentals/properties/PropertyDetails'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const PropertyDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <PropertyDetails propertyId={id} serverMode={serverMode} />
}

export default PropertyDetailsPage
