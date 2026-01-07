// Component Imports
import EditUnit from '@views/apps/rentals/units/EditUnit'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const EditUnitPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <EditUnit unitId={id} serverMode={serverMode} />
}

export default EditUnitPage
