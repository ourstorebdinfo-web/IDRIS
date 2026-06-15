import CartClient from './CartClient'

export const metadata = {
    title: 'Your Cart | GoCart',
    description: 'View the items in your shopping cart and proceed to checkout.',
}

export default function CartPage() {
    return <CartClient />
}