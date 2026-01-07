// Component Imports
import UnitDetails from '@views/apps/rentals/units/UnitDetails'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const UnitDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <UnitDetails unitId={id} serverMode={serverMode} />
}

export default UnitDetailsPage
