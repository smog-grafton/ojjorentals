// Component Imports
import PaymentsView from '@views/apps/rentals/payments/PaymentsView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const PaymentsPage = async () => {
  const serverMode = await getServerMode()

  return <PaymentsView serverMode={serverMode} />
}

export default PaymentsPage
