// Component Imports
import SettingsView from '@views/apps/rentals/settings/SettingsView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const SettingsPage = async () => {
  const serverMode = await getServerMode()

  return <SettingsView serverMode={serverMode} />
}

export default SettingsPage
