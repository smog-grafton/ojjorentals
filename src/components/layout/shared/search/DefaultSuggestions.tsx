// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type DefaultSuggestionsType = {
  sectionLabel: string
  items: {
    label: string
    href: string
    icon?: string
  }[]
}

const defaultSuggestions: DefaultSuggestionsType[] = [
  {
    sectionLabel: 'Popular Searches',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboards/rentals',
        icon: 'ri-home-4-line'
      },
      {
        label: 'Tenants',
        href: '/apps/rentals/tenants/list',
        icon: 'ri-user-3-line'
      },
      {
        label: 'Invoices',
        href: '/apps/rentals/invoices/list',
        icon: 'ri-file-list-3-line'
      },
      {
        label: 'Properties',
        href: '/apps/rentals/properties/list',
        icon: 'ri-building-4-line'
      }
    ]
  },
  {
    sectionLabel: 'Rentals System',
    items: [
      {
        label: 'Tenants',
        href: '/apps/rentals/tenants/list',
        icon: 'ri-user-3-line'
      },
      {
        label: 'Properties',
        href: '/apps/rentals/properties/list',
        icon: 'ri-building-4-line'
      },
      {
        label: 'Units',
        href: '/apps/rentals/units/list',
        icon: 'ri-home-line'
      },
      {
        label: 'Invoices',
        href: '/apps/rentals/invoices/list',
        icon: 'ri-file-list-3-line'
      }
    ]
  },
  {
    sectionLabel: 'Payments & Reports',
    items: [
      {
        label: 'Record Payment',
        href: '/apps/rentals/payments/record',
        icon: 'ri-money-dollar-circle-line'
      },
      {
        label: 'Receipts',
        href: '/apps/rentals/receipts',
        icon: 'ri-receipt-line'
      },
      {
        label: 'Reports',
        href: '/apps/rentals/reports',
        icon: 'ri-bar-chart-line'
      },
      {
        label: 'Settings',
        href: '/apps/rentals/settings',
        icon: 'ri-settings-4-line'
      }
    ]
  }
]

const DefaultSuggestions = ({ setOpen }: { setOpen: (value: boolean) => void }) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs uppercase text-textDisabled tracking-[0.8px]'>{section.sectionLabel}</p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale as Locale)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl shrink-0')} />}
                  <p className='text-[15px] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
