/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()

  const [cartId, setCartId] = useState(() => {
    const savedCartId = localStorage.getItem('cartId')
    return savedCartId ? Number(savedCartId) : null
  })

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems')
    try {
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(false)

  // Persist cartItems to localStorage on change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  // Persist cartId to localStorage on change
  useEffect(() => {
    if (cartId) {
      localStorage.setItem('cartId', String(cartId))
    } else {
      localStorage.removeItem('cartId')
    }
  }, [cartId])

  // Helper to merge guest items into authenticated backend cart
  const mergeGuestItems = async (targetCartId, currentGuestItems, backendExistingItems) => {
    if (!targetCartId || !Array.isArray(currentGuestItems) || currentGuestItems.length === 0) {
      return backendExistingItems || []
    }

    const existingMenuIds = new Set(
      (backendExistingItems || []).map((i) => i.menuItem?.menuItemId)
    )

    const itemsToMerge = currentGuestItems.filter(
      (g) => g.menuItem?.menuItemId && !existingMenuIds.has(g.menuItem.menuItemId)
    )

    if (itemsToMerge.length === 0) {
      return backendExistingItems || []
    }

    const added = []
    for (const g of itemsToMerge) {
      try {
        const addRes = await api.post('/cart-items/add', null, {
          params: {
            cartId: targetCartId,
            menuItemId: g.menuItem.menuItemId,
            quantity: g.quantity || 1,
          },
        })
        if (addRes.data) {
          added.push(addRes.data)
        }
      } catch (err) {
        console.warn('Failed to merge guest item to backend cart:', err)
      }
    }

    return [...(backendExistingItems || []), ...added]
  }

  // Fetch or initialize user cart from backend asynchronously and merge guest items
  useEffect(() => {
    let isMounted = true

    async function syncAndMergeUserCart() {
      if (!isAuthenticated || !user?.userId) return

      let guestItems = []
      const saved = localStorage.getItem('cartItems')
      if (saved) {
        try {
          guestItems = JSON.parse(saved)
        } catch {
          guestItems = []
        }
      }

      try {
        let activeCartId = null
        let backendItems = []

        try {
          const res = await api.get(`/carts/user/${user.userId}`)
          activeCartId = res.data?.cartId
          backendItems = res.data?.cartItems || []
        } catch (err) {
          if (err.response?.status === 404 || err.response?.status === 400) {
            const createRes = await api.post(`/carts/user/${user.userId}`)
            activeCartId = createRes.data?.cartId
            backendItems = createRes.data?.cartItems || []
          } else {
            throw err
          }
        }

        if (activeCartId) {
          const merged = await mergeGuestItems(activeCartId, guestItems, backendItems)
          if (isMounted) {
            setCartId(activeCartId)
            setCartItems(merged)
          }
        }
      } catch (err) {
        console.error('Failed to sync or merge user cart on backend:', err)
      }
    }

    syncAndMergeUserCart()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user])

  // Manual sync user cart
  const syncUserCart = async () => {
    if (!isAuthenticated || !user?.userId) return
    setLoading(true)
    try {
      const res = await api.get(`/carts/user/${user.userId}`)
      if (res.data?.cartId) {
        setCartId(res.data.cartId)
        setCartItems(res.data.cartItems || [])
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        try {
          const createRes = await api.post(`/carts/user/${user.userId}`)
          if (createRes.data?.cartId) {
            setCartId(createRes.data.cartId)
            setCartItems(createRes.data.cartItems || [])
          }
        } catch (createErr) {
          console.error('Failed to create cart on backend:', createErr)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (menuItem, quantity = 1) => {
    if (!menuItem || !menuItem.menuItemId) return

    if (isAuthenticated && cartId) {
      try {
        // POST /cart-items/add?cartId=...&menuItemId=...&quantity=...
        const response = await api.post('/cart-items/add', null, {
          params: {
            cartId,
            menuItemId: menuItem.menuItemId,
            quantity,
          },
        })

        const savedItem = response.data

        setCartItems((prevItems) => {
          const existingIndex = prevItems.findIndex(
            (item) => item.menuItem?.menuItemId === menuItem.menuItemId
          )
          if (existingIndex > -1) {
            const updated = [...prevItems]
            updated[existingIndex] = savedItem
            return updated
          }
          return [...prevItems, savedItem]
        })
        return savedItem
      } catch (error) {
        console.error('Failed to add item to backend cart:', error)
      }
    }

    // Local / Guest fallback
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.menuItem?.menuItemId === menuItem.menuItemId
      )
      if (existingIndex > -1) {
        const updated = [...prevItems]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      return [
        ...prevItems,
        {
          cartItemId: Date.now(),
          quantity,
          menuItem,
        },
      ]
    })
  }

  // Update item quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    if (isAuthenticated && typeof cartItemId === 'number' && cartItemId < 1000000000000) {
      try {
        // PUT /cart-items/{id}/quantity?quantity=...
        const response = await api.put(`/cart-items/${cartItemId}/quantity`, null, {
          params: { quantity: newQuantity },
        })

        const updatedItem = response.data
        setCartItems((prev) =>
          prev.map((item) => (item.cartItemId === cartItemId ? updatedItem : item))
        )
        return updatedItem
      } catch (error) {
        console.error('Failed to update quantity on backend:', error)
      }
    }

    // Local fallback
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const increaseQuantity = async (cartItemId) => {
    const item = cartItems.find((i) => i.cartItemId === cartItemId)
    if (item) {
      await updateQuantity(cartItemId, item.quantity + 1)
    }
  }

  const decreaseQuantity = async (cartItemId) => {
    const item = cartItems.find((i) => i.cartItemId === cartItemId)
    if (item) {
      await updateQuantity(cartItemId, item.quantity - 1)
    }
  }

  // Remove single item from cart
  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated && typeof cartItemId === 'number' && cartItemId < 1000000000000) {
      try {
        // DELETE /cart-items/{id}
        await api.delete(`/cart-items/${cartItemId}`)
      } catch (error) {
        console.error('Failed to delete cart item on backend:', error)
      }
    }

    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  // Clear all items in cart
  const clearCart = async () => {
    if (isAuthenticated && cartId) {
      try {
        // DELETE /cart-items/cart/{cartId}/clear
        await api.delete(`/cart-items/cart/${cartId}/clear`)
      } catch (error) {
        console.error('Failed to clear cart on backend:', error)
      }
    }

    setCartItems([])
  }

  // Reset cart state after successful order placement (since backend already deleted cart items)
  const resetCart = () => {
    setCartItems([])
    localStorage.removeItem('cartItems')
  }

  // Calculate totals
  const totalCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
  }, [cartItems])

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.menuItem?.price) || 0
      return total + price * (item.quantity || 0)
    }, 0)
  }, [cartItems])

  const value = {
    cartId,
    cartItems,
    totalCount,
    subtotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    resetCart,
    syncUserCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Custom hook to consume CartContext
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
