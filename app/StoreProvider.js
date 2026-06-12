'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { loadCartFromDB, addToCart, clearCart, syncCartToDB } from '@/lib/features/cart/cartSlice'
import { useSession } from 'next-auth/react'

function CartPersistence({ storeRef }) {
  const { data: session } = useSession()
  const hasLoadedCartRef = useRef(false)

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gocart-cart')
      if (saved) {
        const { cartItems } = JSON.parse(saved)
        if (cartItems && Object.keys(cartItems).length > 0) {
          // Hydrate the store with saved cart
          const store = storeRef.current
          store.dispatch(clearCart())
          for (const [key, qty] of Object.entries(cartItems)) {
            const parts = key.split('_')
            const productId = parts[0]
            const color = parts[1] || ''
            const size = parts[2] || ''
            for (let i = 0; i < qty; i++) {
              store.dispatch(addToCart({ productId, color, size }))
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore cart from localStorage', e)
    }
  }, [storeRef])

  // If user is authenticated, load cart from DB (overrides localStorage) once
  useEffect(() => {
    if (session?.user && storeRef.current && !hasLoadedCartRef.current) {
      hasLoadedCartRef.current = true
      storeRef.current.dispatch(loadCartFromDB())
    } else if (!session?.user) {
      // Reset the loaded flag if they log out
      hasLoadedCartRef.current = false
    }
  }, [session, storeRef])

  // Subscribe to store changes, save cart to localStorage, and sync to DB
  useEffect(() => {
    const store = storeRef.current
    if (!store) return

    let syncTimeout = null

    const unsubscribe = store.subscribe(() => {
      try {
        const { cart } = store.getState()
        localStorage.setItem('gocart-cart', JSON.stringify({ cartItems: cart.cartItems }))

        // If user is authenticated and we have loaded their cart, sync changes to DB
        if (session?.user && hasLoadedCartRef.current) {
          if (syncTimeout) {
            clearTimeout(syncTimeout)
          }
          syncTimeout = setTimeout(() => {
            store.dispatch(syncCartToDB())
          }, 1000) // Debounce by 1 second to avoid excessive database writes
        }
      } catch (e) {
        // Storage quota exceeded — ignore
      }
    })
    return () => {
      unsubscribe()
      if (syncTimeout) {
        clearTimeout(syncTimeout)
      }
    }
  }, [storeRef, session])

  return null
}

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }



  return (
    <Provider store={storeRef.current}>
      <CartPersistence storeRef={storeRef} />
      {children}
    </Provider>
  )
}