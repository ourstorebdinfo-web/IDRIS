'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { parseJsonArray, getColorName } from '@/lib/utils'
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast';
import { getCombinedRatings } from '@/lib/demoReviews';

const ProductDetails = ({ product }) => {

    const productId = product?.id || '';
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const name = product?.name || 'Product'
    const price = product?.price ?? 0
    const mrp = product?.mrp ?? 0
    const inStock = product?.inStock ?? true
    const featured = product?.featured ?? false

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    // normalize images field
    const images = parseJsonArray(product?.images)

    const placeholderImage = '/uploads/placeholder.svg'
    const [mainImage, setMainImage] = useState(images[0] || placeholderImage);
    
    // Deterministic demo ratings initialization
    const initialDemo = getCombinedRatings(productId, name, [])
    const [ratingInfo, setRatingInfo] = useState({
        averageRating: initialDemo.averageRating,
        reviewCount: initialDemo.reviewCount,
        canRate: false,
        userRating: null,
        orderId: null,
    });
    const [selectedRating, setSelectedRating] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const colors = parseJsonArray(product?.colors)
    const sizes = parseJsonArray(product?.sizes)

    const [selectedColor, setSelectedColor] = useState('')
    const [selectedSize, setSelectedSize] = useState('')

    useEffect(() => {
        if (colors.length > 0) setSelectedColor(colors[0])
        if (sizes.length > 0) setSelectedSize(sizes[0])
    }, [colors, sizes])

    const addToCartHandler = () => {
        dispatch(addToCart({ productId, color: selectedColor, size: selectedSize }))
        toast.success('Added to cart!')
    }

    const quickOrderHandler = () => {
        dispatch(addToCart({ productId, color: selectedColor, size: selectedSize }))
        toast.success('Added to cart!')
        router.push('/cart')
    }

    useEffect(() => {
        const fetchRatingInfo = async () => {
            try {
                const res = await fetch(`/api/ratings?productId=${productId}`, { credentials: 'include', cache: 'no-store' })
                if (!res.ok) {
                    console.error('Rating fetch failed', res.status)
                    return
                }
                const ratingEligibility = await res.json()
                setRatingInfo({
                    averageRating: ratingEligibility.averageRating ?? 0,
                    reviewCount: ratingEligibility.reviewCount ?? 0,
                    canRate: ratingEligibility.canRate ?? Boolean(ratingEligibility.orderId),
                    userRating: ratingEligibility.userRating ?? null,
                    orderId: ratingEligibility.orderId ?? null,
                })
            } catch (err) {
                console.error('Failed to load rating info', err)
            }
        }

        if (productId) {
            fetchRatingInfo()
        }
    }, [productId, colors, sizes])

    const submitRating = async (value) => {
        if (!ratingInfo.canRate || !ratingInfo.orderId || isSubmittingRating) return
        setSelectedRating(value)
        setIsSubmittingRating(true)

        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productId, orderId: ratingInfo.orderId, rating: value }),
            })

            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                throw new Error(json.error || 'Failed to submit rating')
            }

            const json = await res.json()
            setRatingInfo({
                averageRating: json.averageRating ?? ratingInfo.averageRating,
                reviewCount: json.reviewCount ?? ratingInfo.reviewCount,
                canRate: false,
                userRating: value,
                orderId: null,
            })
            toast.success('Rating submitted successfully')
        } catch (err) {
            toast.error(err.message || 'Unable to submit rating')
            console.error(err)
        } finally {
            setIsSubmittingRating(false)
        }
    }


    return (
        <div className="flex max-lg:flex-col gap-8 sm:gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3 min-w-0">
                {/* Thumbnails — horizontal scroll on mobile, vertical on sm+ */}
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible no-scrollbar flex-shrink-0">
                    {(images.length ? images : [placeholderImage]).map((image, index) => (
                        <div key={index} onClick={() => setMainImage(image || placeholderImage)} className="bg-slate-100 flex items-center justify-center rounded-lg group cursor-pointer flex-shrink-0" style={{width:56, height:56}}>
                            <div className="relative w-14 h-14">
                                <Image src={image || placeholderImage} alt={`thumb-${index}`} fill sizes="56px" priority={index === 0} style={{objectFit:'cover'}} className="rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Main image — fully responsive, no fixed pixel width */}
                <div className="flex items-center justify-center rounded-lg overflow-hidden bg-white w-full sm:w-[420px] aspect-square flex-shrink-0 force-clip">
                    <div className="relative w-full h-full">
                        <Image src={mainImage || placeholderImage} alt={name} fill sizes="(max-width: 640px) 100vw, 420px" priority={true} style={{objectFit:'cover', objectPosition:'center'}} />
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{name}</h1>
                
                {/* Status & Ratings Row */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {inStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            In Stock
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 border border-red-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                            Out of Stock
                        </span>
                    )}
                    {featured && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                            ⭐ Featured
                        </span>
                    )}
                    <div className='flex items-center gap-0.5 border-l border-slate-200 pl-3 h-4'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={12} className={`${ratingInfo.averageRating >= index + 1 ? 'text-[#00C950] fill-[#00C950]' : 'text-slate-300 fill-transparent'}`} />
                        ))}
                        <span className="text-xs text-slate-500 ml-1.5">{ratingInfo.reviewCount} Reviews</span>
                    </div>
                </div>

                {ratingInfo.canRate && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">Rate this product</p>
                        <p className="text-xs text-slate-500 mt-1">Only customers who ordered this item can submit a rating.</p>
                        <div className="flex items-center gap-2 mt-3">
                            {Array.from({ length: 5 }, (_, index) => (
                                <StarIcon
                                    key={index}
                                    size={20}
                                    className={`${selectedRating > index ? 'text-green-400 fill-green-400' : 'text-slate-300 fill-transparent'} cursor-pointer transition`}
                                    onClick={() => submitRating(index + 1)}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Tap a star to submit your rating.</p>
                    </div>
                )}
                {!ratingInfo.canRate && ratingInfo.userRating && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">Your rating</p>
                        <div className="flex items-center gap-2 mt-2">
                            {Array.from({ length: 5 }, (_, index) => (
                                <StarIcon
                                    key={index}
                                    size={16}
                                    className={ratingInfo.userRating > index ? 'text-green-400 fill-green-400' : 'text-slate-300 fill-transparent'}
                                />
                            ))}
                            <span className="text-sm text-slate-500">{ratingInfo.userRating} Stars</span>
                        </div>
                    </div>
                )}

                {/* Prices & Discount Tag Row */}
                <div className="flex flex-wrap items-baseline gap-3 mt-4 mb-6">
                    <span className="text-3xl font-semibold text-slate-800">{currency}{price}</span>
                    <span className="text-lg text-slate-400 line-through">{currency}{mrp}</span>
                    {mrp > price && mrp > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 ml-1">
                            <TagIcon size={12} />
                            Save {Math.round(((mrp - price) / mrp) * 100)}%
                        </span>
                    )}
                </div>

                {/* Options Selection */}
                <div className="my-6 space-y-4 border-t border-slate-100 pt-4">
                    {colors.length > 0 && (
                        <div>
                            <span className="text-sm font-semibold text-slate-700 block mb-2">
                                Select Color: <span className="text-slate-500 font-medium">{getColorName(selectedColor)}</span>
                            </span>
                            <div className="flex flex-wrap gap-3 items-center">
                                {colors.map((color) => {
                                    const isColorCode = color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl') || /^(red|green|blue|black|white|yellow|orange|purple|pink|gray|grey|brown|cyan|magenta|lime|olive|teal|navy|maroon|silver|gold|indigo|violet|aqua)$/i.test(color);
                                    if (isColorCode) {
                                        const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white';
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                title={getColorName(color)}
                                                className={`w-9 h-9 rounded-full border-2 transition active:scale-95 flex items-center justify-center relative ${
                                                    selectedColor === color
                                                        ? 'border-slate-800 ring-2 ring-slate-800/20 scale-105 shadow-sm'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {selectedColor === color && (
                                                    <span className={`w-2.5 h-2.5 rounded-full ${isWhite ? 'bg-slate-800' : 'bg-white'}`} />
                                                )}
                                            </button>
                                        );
                                    }
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 text-xs font-semibold rounded-full border transition active:scale-95 ${
                                                selectedColor === color
                                                    ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {sizes.length > 0 && (
                        <div>
                            <span className="text-sm font-semibold text-slate-700 block mb-2">Select Size</span>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 text-xs font-semibold rounded-md border transition active:scale-95 ${
                                            selectedSize === size
                                                ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-end gap-5 mt-10">
                    {
                        (() => {
                            const key = `${productId}_${selectedColor || ''}_${selectedSize || ''}`
                            return cart[key] ? (
                                <div className="flex flex-col gap-3">
                                    <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                    <Counter productId={productId} cartKey={key} />
                                </div>
                            ) : null
                        })()
                    }
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        {inStock ? (
                            <>
                                <button 
                                    onClick={addToCartHandler} 
                                    className="flex-1 sm:flex-none bg-slate-800 text-white px-6 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                </button>
                                <button 
                                    onClick={quickOrderHandler} 
                                    className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-3 text-sm font-medium rounded hover:bg-green-700 active:scale-95 transition flex items-center justify-center gap-2 shimmer-btn"
                                >
                                    <Zap size={18} />
                                    Order now
                                </button>
                            </>
                        ) : (
                            <button
                                disabled
                                className="w-full sm:w-auto bg-slate-200 text-slate-400 px-6 py-3 text-sm font-medium rounded cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} />
                                Out of Stock
                            </button>
                        )}
                    </div>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> সারা বাংলাদেশে ডেলিভারি </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails