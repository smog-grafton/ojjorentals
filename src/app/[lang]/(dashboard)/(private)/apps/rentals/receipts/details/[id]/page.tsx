// Component Imports
import ReceiptDetails from '@views/apps/rentals/receipts/ReceiptDetails'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ReceiptDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <ReceiptDetails receiptId={id} serverMode={serverMode} />
}

export default ReceiptDetailsPage
