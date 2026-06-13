'use client'
import Counter from "@/components/Counter";
import QuickOrderForm from "@/components/QuickOrderForm";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { loadProducts } from "@/lib/features/product/productSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getColorName, parseJsonArray } from "@/lib/utils";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const handleDeleteItemFromCart = (key) => {
        dispatch(deleteItemFromCart({ key }))
    }

    useEffect(() => {
        if (products.length === 0) {
            dispatch(loadProducts());
        }
    }, [products.length, dispatch]);

    useEffect(() => {
        if (products.length === 0) return;
        const arr = [];
        let total = 0;
        for (const [key, value] of Object.entries(cartItems)) {
            const [productId, color, size] = key.split('_');
            const product = products.find(p => p.id === productId);
            if (product) {
                arr.push({ ...product, key, color, size, quantity: value });
                total += product.price * value;
            }
        }
        setTotalPrice(total);
        setCartArray(arr);
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">

            <div className="max-w-7xl mx-auto ">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" path="/shop" linkText="Add more" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col w-full">

                    <div className="w-full overflow-x-auto">
                        <table 
                            className="w-full max-w-4xl text-slate-600 table-auto sm:min-w-[600px]"
                            style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}
                        >
                            <thead>
                                <tr className="max-sm:text-sm text-slate-500">
                                    <th className="text-left pb-2 px-4 font-semibold text-sm">Product</th>
                                    <th className="pb-2 px-4 font-semibold text-sm">Quantity</th>
                                    <th className="pb-2 px-4 font-semibold text-sm">Total Price</th>
                                    <th className="pb-2 px-4 font-semibold text-sm">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    cartArray.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border-y border-l border-slate-200 rounded-l-2xl p-4 bg-white">
                                                <div className="flex gap-3 items-center">
                                                    <div className="flex gap-3 items-center justify-center bg-slate-100 w-16 h-16 rounded-md shrink-0">
                                                        <Image src={parseJsonArray(item.images)[0] || '/uploads/placeholder.svg'} className="h-14 w-auto" alt={item.name} width={45} height={45} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">{item.category}</p>
                                                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                                            {item.color && (
                                                                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 px-1 py-px rounded">
                                                                    <span className="w-2 h-2 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.color }}></span>
                                                                    {getColorName(item.color)}
                                                                </span>
                                                            )}
                                                            {item.size && (
                                                                <span className="text-[10px] text-slate-500 px-1 py-px rounded">
                                                                    {item.size}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 font-medium text-slate-700">{currency}{item.price}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-y border-slate-200 p-4 bg-white text-center">
                                                <div className="inline-flex justify-center w-full">
                                                    <Counter productId={item.id} cartKey={item.key} />
                                                </div>
                                            </td>
                                            <td className="border-y border-slate-200 p-4 bg-white text-center font-semibold text-slate-800">
                                                {currency}{(item.price * item.quantity).toLocaleString()}
                                            </td>
                                            <td className="border-y border-r border-slate-200 rounded-r-2xl p-4 bg-white text-center">
                                                <button onClick={() => handleDeleteItemFromCart(item.key)} className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                    <Trash2Icon size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <QuickOrderForm totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
        </div>
    )
}