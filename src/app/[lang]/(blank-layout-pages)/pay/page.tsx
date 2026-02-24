import type { Metadata } from 'next'
import Pay from '@views/Pay'

export const metadata: Metadata = {
  title: 'Pay rent',
  description: 'Pay your pending rent invoices via mobile money'
}

const PayPage = () => <Pay />

export default PayPage
