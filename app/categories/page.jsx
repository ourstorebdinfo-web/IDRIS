import Link from 'next/link'
import prisma from '@/lib/prisma'

export const revalidate = 60

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="mx-6 mb-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-emerald-600">Categories</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Explore products by category and discover collections curated for every need.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm category-card">
              <div className="h-52 overflow-hidden bg-slate-100 force-clip">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover category-card-zoom" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-50">No image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-emerald-600">{category.slug}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{category.name}</h2>
                <p className="mt-3 text-sm text-slate-500 line-clamp-3">{category.description || 'Shop products in this category.'}</p>
                <div className="mt-4 text-sm font-semibold text-slate-700">{category._count?.products || 0} products</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
