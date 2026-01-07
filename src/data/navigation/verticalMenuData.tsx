// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => {
  const nav = dictionary['navigation'] as any
  return [
  {
    label: nav.rentalsDashboard || 'Dashboard',
    icon: 'ri-home-smile-line',
    href: '/dashboards/rentals'
  },
  {
    label: nav.rentalsSystem || 'Rentals System',
    isSection: true,
    children: [
      {
        label: nav.tenants,
        icon: 'ri-group-line',
        children: [
          {
            label: nav.list,
            href: '/apps/rentals/tenants/list'
          },
          {
            label: nav.addTenant,
            href: '/apps/rentals/tenants/add'
          }
        ]
      },
      {
        label: nav.units,
        icon: 'ri-building-line',
        children: [
          {
            label: nav.list,
            href: '/apps/rentals/units/list'
          },
          {
            label: nav.addUnit,
            href: '/apps/rentals/units/add'
          }
        ]
      },
      {
        label: nav.properties,
        icon: 'ri-community-line',
        children: [
          {
            label: nav.list,
            href: '/apps/rentals/properties/list'
          },
          {
            label: nav.addProperty,
            href: '/apps/rentals/properties/add'
          }
        ]
      },
      {
        label: nav.invoices,
        icon: 'ri-file-list-3-line',
        children: [
          {
            label: nav.list,
            href: '/apps/rentals/invoices/list'
          },
          {
            label: nav.addInvoice,
            href: '/apps/rentals/invoices/add'
          }
        ]
      },
      {
        label: nav.payments,
        icon: 'ri-money-dollar-circle-line',
        href: '/apps/rentals/payments'
      },
      {
        label: nav.receipts,
        icon: 'ri-receipt-line',
        href: '/apps/rentals/receipts'
      },
      {
        label: 'Bills',
        icon: 'ri-file-list-3-line',
        children: [
          {
            label: nav.list,
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
            label: nav.list,
            href: '/apps/rentals/expenses/list'
          },
          {
            label: 'Add Expense',
            href: '/apps/rentals/expenses/add'
          }
        ]
      },
      {
        label: nav.overdue,
        icon: 'ri-alert-line',
        href: '/apps/rentals/overdue'
      },
      {
        label: nav.reminders,
        icon: 'ri-notification-line',
        href: '/apps/rentals/reminders'
      },
      {
        label: nav.notifications,
        icon: 'ri-notification-2-line',
        href: '/apps/rentals/notifications'
      },
      {
        label: nav.reports,
        icon: 'ri-bar-chart-box-line',
        href: '/apps/rentals/reports'
      },
      {
        label: nav.settings,
        icon: 'ri-settings-3-line',
        href: '/apps/rentals/settings'
      },
      {
        label: nav.users || 'Users',
        icon: 'ri-user-3-line',
        href: '/apps/rentals/users/list'
      },
      {
        label: nav.roles || 'Roles',
        icon: 'ri-shield-user-line',
        href: '/apps/rentals/roles'
      }
    ]
  }
  ]
}

export default verticalMenuData
