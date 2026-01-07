// Component Imports
import ReceiptsView from '@views/apps/rentals/receipts/ReceiptsView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ReceiptsPage = async () => {
  const serverMode = await getServerMode()

  return <ReceiptsView serverMode={serverMode} />
}

export default ReceiptsPage
