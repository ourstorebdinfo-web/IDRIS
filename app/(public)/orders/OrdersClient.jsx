'use client'
import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ArrowRight, ShoppingBag } from 'lucide-react'
import PageTitle from '@/components/PageTitle'
import { parseJsonArray, getColorName } from '@/lib/utils'

const getStatusStyle = (statusStr) => {
    const s = statusStr?.toUpperCase() || ''
    if (s.includes('PLACE')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (s.includes('PROCESS') || s.includes('PEND')) return 'bg-amber-50 text-amber-700 border-amber-200'
    if (s.includes('DELIVER') || s.includes('SHIP') || s.includes('COMPLET') || s.includes('SUCCESS')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (s.includes('CANCEL') || s.includes('FAIL') || s.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200'
    return 'bg-slate-50 text-slate-700 border-slate-200'
}

const formatStatusText = (statusStr) => {
    return statusStr ? statusStr.replace(/_/g, ' ') : ''
}

export default function OrdersClient() {
    const { data: session, status } = useSession()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    useEffect(() => {
        const controller = new AbortController()
        if (status === 'authenticated') {
            const fetchOrders = async () => {
                try {
                    setError(null)
                    const res = await fetch('/api/orders', { signal: controller.signal })
                    if (res.ok) {
                        const data = await res.json()
                        setOrders(data.orders || [])
                    } else {
                        setError('Failed to load orders. Please try again.')
                    }
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('Error fetching orders:', err)
                        setError('Failed to load orders. Please try again.')
                    }
                } finally {
                    if (!controller.signal.aborted) setLoading(false)
                }
            }
            fetchOrders()
        } else if (status === 'unauthenticated') {
            setLoading(false)
        }
        return () => controller.abort()
    }, [status])

    const handleRetry = useCallback(() => {
        setLoading(true)
        setError(null)
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders')
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data.orders || [])
                } else {
                    setError('Failed to load orders. Please try again.')
                }
            } catch (err) {
                console.error('Error fetching orders:', err)
                setError('Failed to load orders. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (status === 'loading' || (loading && status === 'authenticated')) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-800"></div>
                <p className="text-slate-500 mt-4 text-sm font-medium">Loading your orders...</p>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-[75vh] max-w-md mx-auto px-6 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-6">
                    <ShoppingBag size={40} className="text-slate-600 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Login Required</h1>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                    Please log in to your account to view your purchase history and track your orders.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <button onClick={() => signIn()} className="bg-slate-800 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-slate-900 transition active:scale-95">
                        Log In
                    </button>
                    <Link href="/shop" className="border border-slate-300 text-slate-700 font-medium px-6 py-2.5 rounded-lg hover:bg-slate-50 transition active:scale-95">
                        Go to Shop
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-6 text-slate-800 pb-16">
            <PageTitle heading="My Orders" text="Track and manage your order history" path="/shop" linkText="Continue Shopping" />

            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center max-w-lg mx-auto mt-4 mb-4">
                    <p className="text-sm text-rose-700">{error}</p>
                    <button onClick={handleRetry} className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-800 underline">Try Again</button>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto mt-8">
                    <Package size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No Orders Placed Yet</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">You haven&apos;t made any orders yet. Visit our shop and find the best deals!</p>
                    <Link href="/shop" className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg transition active:scale-95 inline-flex items-center gap-2 text-sm">
                        Start Shopping <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6 mt-6 max-w-4xl mx-auto">
                    {orders.map((order) => {
                        let couponData = {}
                        try {
                            couponData = order.coupon ? JSON.parse(order.coupon) : {}
                        } catch (e) {
                            console.error('Failed to parse coupon data', e)
                        }
                        
                        const dateString = new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })

                        return (
                            <div key={order.id} className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-md">
                                {/* Order Header */}
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Order Placed</p>
                                            <p className="font-medium text-slate-700 mt-0.5">{dateString}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Total Price</p>
                                            <p className="font-semibold text-slate-800 text-sm mt-0.5">{currency}{order.total.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Ship To</p>
                                            <p className="font-medium text-slate-700 mt-0.5">{order.address?.name || 'Customer'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                                            {formatStatusText(order.status)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Details / Items */}
                                <div className="p-6">
                                    <div className="flex flex-col gap-4">
                                        {order.orderItems?.map((item) => {
                                            const images = parseJsonArray(item.product?.images)
                                            const itemImage = images[0] || '/uploads/placeholder.svg'

                                            return (
                                                <div key={item.productId} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                                        <Image src={itemImage} alt={item.product?.name || 'Product'} fill style={{ objectFit: 'cover' }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <Link href={`/product/${item.productId}`} className="font-medium text-slate-800 hover:text-green-600 transition block truncate text-sm sm:text-base">
                                                            {item.product?.name || 'Unknown Product'}
                                                        </Link>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {item.product?.category}
                                                            {item.color && ` | Color: ${getColorName(item.color)}`}
                                                            {item.size && ` | Size: ${item.size}`}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-xs text-slate-500">
                                                                Qty: <span className="font-semibold text-slate-700">{item.quantity}</span>
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {currency}{item.price.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Order Footer Info */}
                                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-500">
                                        <div>
                                            <p><span className="font-semibold text-slate-600">Payment:</span> {order.paymentMethod} {couponData.transactionId && `(Txn: ${couponData.transactionId})`}</p>
                                            <p className="mt-1"><span className="font-semibold text-slate-600">Address:</span> {order.address?.street}, {order.address?.city}, {order.address?.zip}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Order Ref:</span>
                                            <span className="font-mono text-slate-600 select-all bg-slate-100 px-2 py-0.5 rounded">{order.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
