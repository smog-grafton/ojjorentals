// Component Imports
import ReportsView from '@views/apps/rentals/reports/ReportsView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ReportsPage = async () => {
  const serverMode = await getServerMode()

  return <ReportsView serverMode={serverMode} />
}

export default ReportsPage
