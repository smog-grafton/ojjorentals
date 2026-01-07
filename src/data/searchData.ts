type SearchData = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

const data: SearchData[] = [
  // Dashboard
  {
    id: '1',
    name: 'Rentals Dashboard',
    url: '/dashboards/rentals',
    icon: 'ri-home-smile-line',
    section: 'Dashboards'
  },
  // Tenants
  {
    id: '2',
    name: 'Tenants List',
    url: '/apps/rentals/tenants/list',
    icon: 'ri-group-line',
    section: 'Rentals'
  },
  {
    id: '3',
    name: 'Add Tenant',
    url: '/apps/rentals/tenants/add',
    icon: 'ri-user-add-line',
    section: 'Rentals'
  },
  // Properties
  {
    id: '4',
    name: 'Properties List',
    url: '/apps/rentals/properties/list',
    icon: 'ri-community-line',
    section: 'Rentals'
  },
  {
    id: '5',
    name: 'Add Property',
    url: '/apps/rentals/properties/add',
    icon: 'ri-add-line',
    section: 'Rentals'
  },
  // Units
  {
    id: '6',
    name: 'Units List',
    url: '/apps/rentals/units/list',
    icon: 'ri-building-line',
    section: 'Rentals'
  },
  {
    id: '7',
    name: 'Add Unit',
    url: '/apps/rentals/units/add',
    icon: 'ri-add-line',
    section: 'Rentals'
  },
  // Invoices
  {
    id: '8',
    name: 'Invoices List',
    url: '/apps/rentals/invoices/list',
    icon: 'ri-file-list-3-line',
    section: 'Rentals'
  },
  {
    id: '9',
    name: 'Add Invoice',
    url: '/apps/rentals/invoices/add',
    icon: 'ri-file-add-line',
    section: 'Rentals'
  },
  // Payments
  {
    id: '10',
    name: 'Payments',
    url: '/apps/rentals/payments',
    icon: 'ri-money-dollar-circle-line',
    section: 'Rentals'
  },
  {
    id: '11',
    name: 'Record Payment',
    url: '/apps/rentals/payments/record',
    icon: 'ri-money-dollar-circle-line',
    section: 'Rentals'
  },
  // Receipts
  {
    id: '12',
    name: 'Receipts',
    url: '/apps/rentals/receipts',
    icon: 'ri-receipt-line',
    section: 'Rentals'
  },
  // Bills
  {
    id: '13',
    name: 'Bills List',
    url: '/apps/rentals/bills/list',
    icon: 'ri-file-list-3-line',
    section: 'Rentals'
  },
  {
    id: '14',
    name: 'Add Bill',
    url: '/apps/rentals/bills/add',
    icon: 'ri-file-add-line',
    section: 'Rentals'
  },
  {
    id: '15',
    name: 'Record Bill Payment',
    url: '/apps/rentals/bills/payments/record',
    icon: 'ri-money-dollar-circle-line',
    section: 'Rentals'
  },
  // Expenses
  {
    id: '16',
    name: 'Expenses List',
    url: '/apps/rentals/expenses/list',
    icon: 'ri-money-dollar-circle-line',
    section: 'Rentals'
  },
  {
    id: '17',
    name: 'Add Expense',
    url: '/apps/rentals/expenses/add',
    icon: 'ri-add-line',
    section: 'Rentals'
  },
  // Overdue
  {
    id: '18',
    name: 'Overdue',
    url: '/apps/rentals/overdue',
    icon: 'ri-alert-line',
    section: 'Rentals'
  },
  // Reminders
  {
    id: '19',
    name: 'Reminders',
    url: '/apps/rentals/reminders',
    icon: 'ri-notification-line',
    section: 'Rentals'
  },
  // Notifications
  {
    id: '20',
    name: 'Notifications',
    url: '/apps/rentals/notifications',
    icon: 'ri-notification-2-line',
    section: 'Rentals'
  },
  // Reports
  {
    id: '21',
    name: 'Reports',
    url: '/apps/rentals/reports',
    icon: 'ri-bar-chart-box-line',
    section: 'Rentals'
  },
  // Settings
  {
    id: '22',
    name: 'Settings',
    url: '/apps/rentals/settings',
    icon: 'ri-settings-3-line',
    section: 'Rentals'
  },
  // Users
  {
    id: '23',
    name: 'Users List',
    url: '/apps/rentals/users/list',
    icon: 'ri-user-3-line',
    section: 'Rentals'
  },
  // Roles
  {
    id: '24',
    name: 'Roles & Permissions',
    url: '/apps/rentals/roles',
    icon: 'ri-shield-user-line',
    section: 'Rentals'
  }
]

export default data
