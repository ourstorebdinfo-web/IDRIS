'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId, cartKey }) => {

    const { cartItems } = useSelector(state => state.cart);
    const key = cartKey || productId;

    const dispatch = useDispatch();

    // Parse product, color, size from compound key
    const [pid, color, size] = key.split('_');

    const addToCartHandler = () => {
        dispatch(addToCart({ productId: pid, color: color || undefined, size: size || undefined }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId: pid, color: color || undefined, size: size || undefined }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{cartItems[key] || 0}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter