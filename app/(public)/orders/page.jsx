import OrdersClient from './OrdersClient'

export const metadata = {
    title: 'My Orders | GoCart',
    description: 'Track and manage your purchase history and order status on GoCart.',
}

export default function OrdersPage() {
    return <OrdersClient />
}
