'use client'
import { StarIcon, ShoppingCart, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { parseJsonArray } from '@/lib/utils'
import { getCombinedRatings } from '@/lib/demoReviews'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const ProductCard = ({ product, priority = false }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const dispatch = useDispatch()
    const router = useRouter()

    const { averageRating } = getCombinedRatings(product?.id, product?.name, product?.ratings || [])
    const rating = Math.round(averageRating)
    const inStock = product?.inStock ?? true

    // normalize images: support JSON string or array
    const images = parseJsonArray(product?.images)
    const placeholderImage = '/uploads/placeholder.svg'
    const coverImage = images[0] || placeholderImage

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inStock) return
        dispatch(addToCart({ productId: product.id }))
        toast.success('Added to cart!')
    }

    const handleQuickOrder = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inStock) return
        dispatch(addToCart({ productId: product.id }))
        router.push('/cart')
    }

    return (
        <Link href={`/product/${product.id}`} className='group w-full'>
                <div className='bg-[#F5F5F5] w-full rounded-lg overflow-hidden relative aspect-square force-clip'>
                    <div className='relative w-full h-full'>
                        <Image src={coverImage} alt={product.name || 'product image'} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" priority={priority} style={{objectFit: 'cover', objectPosition: 'center'}} className={`card-image-zoom ${inStock ? '' : 'opacity-60'}`} />
                    </div>
                    {/* Out of Stock Overlay */}
                    {!inStock && (
                        <div className='absolute inset-0 flex items-center justify-center bg-black/30 z-10'>
                            <span className='bg-white/90 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow'>
                                Out of Stock
                            </span>
                        </div>
                    )}
                    {/* Buttons Overlay — only shown when in stock */}
                    {inStock && (
                        <div className='absolute bottom-3 right-3 flex gap-2 z-10'>
                            <button 
                                onClick={handleAddToCart} 
                                className='bg-white hover:bg-slate-800 text-slate-800 hover:text-white p-2.5 rounded-full shadow-md transition-colors duration-200 active-scale-90 flex items-center justify-center' 
                                title="Add to Cart"
                            >
                                <ShoppingCart size={16} />
                            </button>
                            <button 
                                onClick={handleQuickOrder} 
                                className='bg-[#00C950] hover:bg-[#00B040] text-white p-2.5 rounded-full shadow-md transition-colors duration-200 active-scale-90 flex items-center justify-center' 
                                title="Order now"
                            >
                                <Zap size={16} />
                            </button>
                        </div>
                    )}
                </div>
            <div className='flex justify-between gap-2 text-sm text-slate-800 pt-2'>
                <div className='min-w-0'>
                    <p className='truncate'>{product?.name}</p>
                    <div className='flex gap-0.5 mt-0.5'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className={`mt-0.5 ${rating >= index + 1 ? 'text-[#00C950] fill-[#00C950]' : 'text-slate-300 fill-transparent'}`} />
                        ))}
                    </div>
                </div>
                <p className='flex-shrink-0 font-medium'>{currency}{product?.price}</p>
            </div>
        </Link>
    )
}

export const ProductCardSkeleton = React.memo(() => {
    return (
        <div className='w-full animate-pulse'>
            <div className='bg-slate-200 w-full rounded-lg aspect-square' />
            <div className='flex justify-between gap-2 text-sm pt-2'>
                <div className='min-w-0 flex-1'>
                    <div className='h-4 bg-slate-200 rounded w-3/4' />
                    <div className='h-3 bg-slate-200 rounded w-1/2 mt-2' />
                </div>
                <div className='h-4 bg-slate-200 rounded w-12' />
            </div>
        </div>
    )
})

export default React.memo(ProductCard)