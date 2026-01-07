// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].rentalsDashboard || 'Dashboard',
    icon: 'ri-home-smile-line',
    href: '/dashboards/rentals'
  },
  {
    label: dictionary['navigation'].rentalsSystem || 'Rentals System',
    isSection: true,
    children: [
      {
        label: dictionary['navigation'].tenants,
        icon: 'ri-group-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/rentals/tenants/list'
          },
          {
            label: dictionary['navigation'].addTenant,
            href: '/apps/rentals/tenants/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].units,
        icon: 'ri-building-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/rentals/units/list'
          },
          {
            label: dictionary['navigation'].addUnit,
            href: '/apps/rentals/units/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].properties,
        icon: 'ri-community-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/rentals/properties/list'
          },
          {
            label: dictionary['navigation'].addProperty,
            href: '/apps/rentals/properties/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].invoices,
        icon: 'ri-file-list-3-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/rentals/invoices/list'
          },
          {
            label: dictionary['navigation'].addInvoice,
            href: '/apps/rentals/invoices/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].payments,
        icon: 'ri-money-dollar-circle-line',
        href: '/apps/rentals/payments'
      },
      {
        label: dictionary['navigation'].receipts,
        icon: 'ri-receipt-line',
        href: '/apps/rentals/receipts'
      },
      {
        label: 'Bills',
        icon: 'ri-file-list-3-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/rentals/bills/list'
          },
          {
            label: 'Add Bill',
            href: '/apps/rentals/bills/add'
          },
          {
            label: 'Record Payment',
            href: '/apps/rentals/bills/payments/record'
          }
        ]
      },
      {
        label: 'Expenses',
        icon: 'ri-money-dollar-circle-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/rentals/expenses/list'
          },
          {
            label: 'Add Expense',
            href: '/apps/rentals/expenses/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].overdue,
        icon: 'ri-alert-line',
        href: '/apps/rentals/overdue'
      },
      {
        label: dictionary['navigation'].reminders,
        icon: 'ri-notification-line',
        href: '/apps/rentals/reminders'
      },
      {
        label: dictionary['navigation'].notifications,
        icon: 'ri-notification-2-line',
        href: '/apps/rentals/notifications'
      },
      {
        label: dictionary['navigation'].reports,
        icon: 'ri-bar-chart-box-line',
        href: '/apps/rentals/reports'
      },
      {
        label: dictionary['navigation'].settings,
        icon: 'ri-settings-3-line',
        href: '/apps/rentals/settings'
      },
      {
        label: dictionary['navigation'].users || 'Users',
        icon: 'ri-user-3-line',
        href: '/apps/rentals/users/list'
      },
      {
        label: dictionary['navigation'].roles || 'Roles',
        icon: 'ri-shield-user-line',
        href: '/apps/rentals/roles'
      }
    ]
  }
]

export default verticalMenuData
