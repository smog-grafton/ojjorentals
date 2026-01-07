// Component Imports
import NotificationsView from '@views/apps/rentals/notifications/NotificationsView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const NotificationsPage = async () => {
  const serverMode = await getServerMode()

  return <NotificationsView serverMode={serverMode} />
}

export default NotificationsPage
