// Component Imports
import ExpensesList from '@views/apps/rentals/expenses/ExpensesList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ExpensesListPage = async () => {
  const serverMode = await getServerMode()

  return <ExpensesList serverMode={serverMode} />
}

export default ExpensesListPage
