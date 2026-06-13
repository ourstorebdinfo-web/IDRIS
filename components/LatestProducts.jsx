'use client'
import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard, { ProductCardSkeleton } from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { loadProducts } from '@/lib/features/product/productSlice'

const LatestProducts = () => {

    const dispatch = useDispatch()
    const displayQuantity = 4
    const products = useSelector(state => state.product.list)

    useEffect(() => {
        if (products.length === 0) {
            dispatch(loadProducts())
        }
    }, [products.length, dispatch])

    const tagged = products.filter(p => p.latest)
    const listToShow = tagged.length ? tagged : products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return (
        <div id="latest-products" className='px-2 sm:px-6 my-20 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${listToShow.length < displayQuantity ? listToShow.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6'>
                {products.length === 0 ? (
                    Array(displayQuantity).fill('').map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))
                ) : (
                    listToShow.slice(0, displayQuantity).map((product, index) => (
                        <ProductCard key={index} product={product} priority={index < 2} />
                    ))
                )}
            </div>
        </div>
    )
}

export default LatestProducts