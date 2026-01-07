// Component Imports
import OverdueView from '@views/apps/rentals/overdue/OverdueView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const OverduePage = async () => {
  const serverMode = await getServerMode()

  return <OverdueView serverMode={serverMode} />
}

export default OverduePage
