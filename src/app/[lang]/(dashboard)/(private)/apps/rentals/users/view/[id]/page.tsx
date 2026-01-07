// Component Imports
import UserView from '@views/apps/rentals/users/UserView'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const UserViewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const serverMode = await getServerMode()
  const { id } = await params

  return <UserView userId={id} serverMode={serverMode} />
}

export default UserViewPage
