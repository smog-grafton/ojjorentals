// Component Imports
import RemindersView from '@views/apps/rentals/reminders/RemindersView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const RemindersPage = async () => {
  const serverMode = await getServerMode()

  return <RemindersView serverMode={serverMode} />
}

export default RemindersPage
