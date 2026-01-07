// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import RentalsOverview from '@views/dashboards/rentals/RentalsOverview'
import TotalTenants from '@views/dashboards/rentals/TotalTenants'
import ExpectedRent from '@views/dashboards/rentals/ExpectedRent'
import CollectedRent from '@views/dashboards/rentals/CollectedRent'
import OverdueAmount from '@views/dashboards/rentals/OverdueAmount'
import RentCollectionChart from '@views/dashboards/rentals/RentCollectionChart'
import OverdueAlerts from '@views/dashboards/rentals/OverdueAlerts'
import RecentInvoices from '@views/dashboards/rentals/RecentInvoices'
import RentalsPerformance from '@views/dashboards/rentals/RentalsPerformance'
import PropertyStatistics from '@views/dashboards/rentals/PropertyStatistics'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const DashboardRentals = async () => {
  // Vars
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12 }}>
        <RentalsOverview serverMode={serverMode} />
      </Grid>

      {/* Stat Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TotalTenants />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ExpectedRent />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CollectedRent />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <OverdueAmount />
      </Grid>

      {/* Main Charts */}
      <Grid size={{ xs: 12, md: 8 }}>
        <RentCollectionChart />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <RentalsPerformance />
      </Grid>

      {/* Overdue Alerts */}
      <Grid size={{ xs: 12, md: 6 }}>
        <OverdueAlerts />
      </Grid>

      {/* Property Statistics */}
      <Grid size={{ xs: 12, md: 6 }}>
        <PropertyStatistics serverMode={serverMode} />
      </Grid>

      {/* Recent Invoices */}
      <Grid size={{ xs: 12 }}>
        <RecentInvoices />
      </Grid>
    </Grid>
  )
}

export default DashboardRentals
