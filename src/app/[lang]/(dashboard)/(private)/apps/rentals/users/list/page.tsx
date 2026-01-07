// Component Imports
import UsersList from '@views/apps/rentals/users/UsersList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const UsersListPage = async () => {
  const serverMode = await getServerMode()

  return <UsersList serverMode={serverMode} />
}

export default UsersListPage
