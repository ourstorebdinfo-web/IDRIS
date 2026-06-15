import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { parseJsonArray } from '@/lib/utils'
import ShopSearch from './ShopSearch'
import { Suspense } from 'react'

export const revalidate = 30

export const metadata = {
    title: 'Shop All Products | GoCart',
    description: 'Browse our full collection of gadgets, accessories, and electronics on GoCart.',
}

const getProducts = unstable_cache(
    async () => {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: { ratings: true },
        })
        return products.map(p => ({
            ...p,
            images: parseJsonArray(p.images),
            colors: parseJsonArray(p.colors),
            sizes: parseJsonArray(p.sizes),
        }))
    },
    ['shop-products'],
    { revalidate: 30, tags: ['products'] }
)

export default async function Shop() {
    const products = await getProducts()
    return (
        <div className="min-h-[70vh] mx-2 sm:mx-6">
            <div className="max-w-7xl mx-auto">
                <Suspense fallback={<div className="w-full text-center py-16 text-slate-400">Loading shop...</div>}>
                    <ShopSearch products={products} />
                </Suspense>
            </div>
        </div>
    )
}