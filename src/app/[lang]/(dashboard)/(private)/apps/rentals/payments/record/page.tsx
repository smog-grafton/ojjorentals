// Component Imports
import RecordPayment from '@views/apps/rentals/payments/RecordPayment'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const RecordPaymentPage = async () => {
  const serverMode = await getServerMode()

  return <RecordPayment serverMode={serverMode} />
}

export default RecordPaymentPage
