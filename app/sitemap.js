import prisma from '@/lib/prisma'

export default async function sitemap() {
    const baseUrl = 'https://ourstorebd.shop'

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ]

    // Dynamic product pages
    let productPages = []
    try {
        const products = await prisma.product.findMany({
            select: { id: true, updatedAt: true },
        })
        productPages = products.map((p) => ({
            url: `${baseUrl}/product/${p.id}`,
            lastModified: p.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }))
    } catch (e) {
        console.error('Sitemap: failed to fetch products', e)
    }

    // Dynamic category pages
    let categoryPages = []
    try {
        const categories = await prisma.category.findMany({
            select: { slug: true, updatedAt: true },
        })
        categoryPages = categories.map((c) => ({
            url: `${baseUrl}/category/${c.slug}`,
            lastModified: c.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.6,
        }))
    } catch (e) {
        console.error('Sitemap: failed to fetch categories', e)
    }

    return [...staticPages, ...productPages, ...categoryPages]
}
