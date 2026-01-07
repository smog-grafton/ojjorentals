// Component Imports
import BillsList from '@views/apps/rentals/bills/BillsList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const BillsListPage = async () => {
  const serverMode = await getServerMode()

  return <BillsList serverMode={serverMode} />
}

export default BillsListPage
