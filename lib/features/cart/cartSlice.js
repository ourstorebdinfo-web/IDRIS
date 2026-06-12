import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, color, size } = action.payload
            const key = `${productId}_${color || ''}_${size || ''}`
            if (state.cartItems[key]) {
                state.cartItems[key]++
            } else {
                state.cartItems[key] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId, color, size } = action.payload
            const key = `${productId}_${color || ''}_${size || ''}`
            if (state.cartItems[key] && state.cartItems[key] > 0) {
                state.cartItems[key]--
                state.total -= 1
                if (state.cartItems[key] === 0) {
                    delete state.cartItems[key]
                }
            }
        },
        deleteItemFromCart: (state, action) => {
            const { key } = action.payload
            state.total -= state.cartItems[key] ? state.cartItems[key] : 0
            state.total = Math.max(0, state.total)
            delete state.cartItems[key]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export const syncCartToDB = () => async (dispatch, getState) => {
    try {
        const { cart } = getState()
        await fetch('/api/cart/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cart.cartItems) })
    } catch (err) {
        console.error('Failed to sync cart', err)
    }
}

export const loadCartFromDB = () => async (dispatch) => {
    try {
        const res = await fetch('/api/cart')
        if (!res.ok) return
        const json = await res.json()
        // Expecting cart as object of productId -> qty
        const remoteCart = json.cart || {}
        // reset current cart and populate
        dispatch(clearCart())
        for (const [key, qty] of Object.entries(remoteCart)) {
            const [productId, color, size] = key.split('_')
            for (let i = 0; i < qty; i++) {
                dispatch(addToCart({ productId, color, size }))
            }
        }
    } catch (err) {
        console.error('Failed to load cart from DB', err)
    }
}

export default cartSlice.reducer
