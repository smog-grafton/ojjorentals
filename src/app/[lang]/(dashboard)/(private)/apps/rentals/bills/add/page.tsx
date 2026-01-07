// Component Imports
import AddBill from '@views/apps/rentals/bills/AddBill'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AddBillPage = async () => {
  const serverMode = await getServerMode()

  return <AddBill serverMode={serverMode} />
}

export default AddBillPage
