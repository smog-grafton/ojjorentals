// Component Imports
import BillDetails from '@views/apps/rentals/bills/BillDetails'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const BillDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <BillDetails billId={id} serverMode={serverMode} />
}

export default BillDetailsPage
