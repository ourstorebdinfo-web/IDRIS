import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import ProductDetails from "@/components/ProductDetails"
import dynamic from 'next/dynamic'
import { parseJsonArray } from '@/lib/utils'

const ProductDescription = dynamic(() => import("@/components/ProductDescription"))

export const revalidate = 60

const getProduct = unstable_cache(
    async (id) => {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { ratings: true }
        })
        if (!product) return null
        return {
            ...product,
            images: parseJsonArray(product.images),
            colors: parseJsonArray(product.colors),
            sizes: parseJsonArray(product.sizes),
        }
    },
    ['product-detail'],
    { revalidate: 60, tags: ['products'] }
)

export async function generateMetadata({ params }) {
    const { productId } = await params
    const product = await getProduct(productId)
    if (!product) return { title: 'Product Not Found' }
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const images = Array.isArray(product.images) ? product.images : parseJsonArray(product.images)
    return {
        title: `${product.name} — ${currency}${product.price}`,
        description: product.description?.slice(0, 160) || product.name,
        openGraph: {
            title: product.name,
            description: product.description?.slice(0, 160),
            images: images?.[0] ? [{ url: images[0] }] : [],
        },
    }
}

export async function generateStaticParams() {
    try {
        const products = await prisma.product.findMany({ select: { id: true }, take: 100 })
        return products.map((p) => ({ productId: p.id }))
    } catch {
        return []
    }
}

export default async function ProductPage({ params }) {
    const { productId } = await params
    const product = await getProduct(productId)
    if (!product) return notFound()

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product.category || 'Products'}
                </div>

                {/* Product Details */}
                <ProductDetails key={`details-${product.id}`} product={product} />
                {/* Description & Reviews */}
                <ProductDescription key={`desc-${product.id}`} product={product} />
            </div>
        </div>
    )
}