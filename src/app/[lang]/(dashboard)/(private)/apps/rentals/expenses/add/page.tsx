// Component Imports
import AddExpense from '@views/apps/rentals/expenses/AddExpense'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AddExpensePage = async () => {
  const serverMode = await getServerMode()

  return <AddExpense serverMode={serverMode} />
}

export default AddExpensePage
