'use client'
import { Suspense, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { loadProducts } from "@/lib/features/product/productSlice"

 function ShopContent() {
    const dispatch = useDispatch()
    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    useEffect(() => {
        if (products.length === 0) {
            dispatch(loadProducts())
        }
    }, [products.length, dispatch])

    const filteredProducts = search
        ? products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    return (
        <div className="min-h-[70vh] mx-2 sm:mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="my-6">
                    <h1 
                        onClick={() => router.push('/shop')} 
                        className="text-lg sm:text-xl font-bold text-slate-800 px-6 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer hover:border-slate-300/60 transition-all duration-300 select-none"
                    >
                        {search && <MoveLeftIcon size={18} />}  
                        All <span className="text-slate-700 font-medium">Products</span>
                    </h1>
                </div>
                {filteredProducts.length === 0 ? (
                    <div className="w-full text-center text-slate-400 py-16">
                        <p className="text-xl font-medium">No products found matching your search.</p>
                        <button onClick={() => router.push('/shop')} className="mt-4 text-green-500 hover:underline">View all products</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6 mb-32">
                        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}