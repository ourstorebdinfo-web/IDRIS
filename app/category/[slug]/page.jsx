import Link from 'next/link'
import prisma from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } })
    return categories.map((cat) => ({ slug: cat.slug }))
  } catch (err) {
    console.error('generateStaticParams error for category:', err)
    return []
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })

  if (!category) {
    return (
      <div className="mx-6 mb-28">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-slate-900">Category not found</h1>
          <p className="mt-3 text-slate-500">Try a different category or return to the <Link href="/categories" className="text-emerald-600">categories page</Link>.</p>
        </div>
      </div>
    )
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { categoryId: category.id },
        { category: category.name },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { ratings: true }
  })

  return (
    <div className="mx-2 sm:mx-6 mb-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-600">Category</div>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">{category.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500">{category.description || 'Products in this category are available for quick checkout.'}</p>
        </div>

        <div className="mb-10">
          <Link href="/categories" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600">← Back to categories</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6 mb-32">
          {products.length > 0 ? products.map((product) => (
            <ProductCard key={product.id} product={product} />
          )) : (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">No products found in this category yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
