// Component Imports
import EditBill from '@views/apps/rentals/bills/EditBill'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const EditBillPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <EditBill billId={id} serverMode={serverMode} />
}

export default EditBillPage
