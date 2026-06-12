'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        const productFromStore = products.find((p) => p.id === productId);
        if (productFromStore) {
            setProduct(productFromStore);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/products/${productId}`)
            if (!res.ok) {
                setLoading(false);
                return;
            }
            const json = await res.json()
            setProduct(json)
        } catch (err) {
            console.error('Failed to fetch product fallback:', err)
        } finally {
            setLoading(false);
        }
    }, [productId, products])

    useEffect(() => {
        fetchProduct()
    }, [fetchProduct]);

    // Scroll to top when productId changes — separate from data fetch
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [productId]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category || 'Products'}
                </div>

                {/* Product Details */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                    </div>
                ) : product ? (
                    <>
                        <ProductDetails key={`details-${product.id}`} product={product} />
                        {/* Description & Reviews */}
                        <ProductDescription key={`desc-${product.id}`} product={product} />
                    </>
                ) : (
                    <div className="flex items-center justify-center min-h-[40vh] text-slate-400">
                        <p className="text-xl">Product not found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}