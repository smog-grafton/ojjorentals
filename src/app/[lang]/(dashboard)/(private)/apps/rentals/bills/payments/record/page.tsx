// Component Imports
import RecordBillPayment from '@views/apps/rentals/bills/RecordBillPayment'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const RecordBillPaymentPage = async () => {
  const serverMode = await getServerMode()

  return <RecordBillPayment serverMode={serverMode} />
}

export default RecordBillPaymentPage
