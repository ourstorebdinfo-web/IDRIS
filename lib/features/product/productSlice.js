import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        loading: false,
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
            state.loading = false
        },
        clearProduct: (state) => {
            state.list = []
            state.loading = false
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const { setProduct, clearProduct, setLoading } = productSlice.actions

export const loadProducts = () => async (dispatch, getState) => {
    const { list, loading } = getState().product
    if (list.length > 0 || loading) return

    dispatch(setLoading(true))
    try {
        const res = await fetch('/api/products')
        if (!res.ok) {
            console.error(`Failed to load products: HTTP ${res.status}`, await res.text())
            dispatch(setLoading(false))
            return
        }
        const json = await res.json()
        if (json.products && Array.isArray(json.products)) {
            dispatch(setProduct(json.products))
        } else {
            console.error('Invalid products response structure:', json)
            dispatch(setProduct([]))
        }
    } catch (err) {
        console.error('Failed to load products:', err.message)
        dispatch(setProduct([]))
    }
}

export default productSlice.reducer