// Component Imports
import EditExpense from '@views/apps/rentals/expenses/EditExpense'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const EditExpensePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <EditExpense expenseId={id} serverMode={serverMode} />
}

export default EditExpensePage
