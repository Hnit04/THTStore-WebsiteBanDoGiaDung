"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart } from "../lib/api.js"
import { useAuth } from "./AuthContext.jsx"
import toast from "react-hot-toast"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Tải giỏ hàng khi người dùng đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      // Nếu không đăng nhập, tải giỏ hàng từ localStorage
      const localCart = localStorage.getItem("cart")
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart)
          setCart(Array.isArray(parsedCart) ? parsedCart : [])
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error)
          setCart([])
        }
      }
    }
  }, [isAuthenticated, user])

  // Lưu giỏ hàng vào localStorage khi không đăng nhập
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, isAuthenticated])

  // Tải giỏ hàng từ API
  const fetchCart = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const data = await getCart()
      setCart(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast.error("Không thể tải giỏ hàng")
    } finally {
      setLoading(false)
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        await apiAddToCart(product._id, quantity)
        fetchCart() // Tải lại giỏ hàng sau khi thêm
        toast.success("Đã thêm vào giỏ hàng")
      } catch (error) {
        console.error("Error adding to cart:", error)
        toast.error("Không thể thêm vào giỏ hàng")
      } finally {
        setLoading(false)
      }
    } else {
      // Xử lý giỏ hàng cục bộ khi không đăng nhập
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((item) => item.product._id === product._id)

        if (existingItemIndex >= 0) {
          // Cập nhật số lượng nếu sản phẩm đã tồn tại
          const updatedCart = [...prevCart]
          updatedCart[existingItemIndex].quantity += quantity
          return updatedCart
        } else {
          // Thêm mới nếu sản phẩm chưa có trong giỏ hàng
          return [
            ...prevCart,
            {
              _id: `local-${Date.now()}`,
              product,
              quantity,
            },
          ]
        }
      })

      toast.success("Đã thêm vào giỏ hàng")
    }
  }

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return

    if (isAuthenticated) {
      try {
        setLoading(true)
        await updateCartItem(itemId, quantity)
        fetchCart() // Tải lại giỏ hàng sau khi cập nhật
      } catch (error) {
        console.error("Error updating cart:", error)
        toast.error("Không thể cập nhật giỏ hàng")
      } finally {
        setLoading(false)
      }
    } else {
      // Cập nhật giỏ hàng cục bộ
      setCart((prevCart) => prevCart.map((item) => (item._id === itemId ? { ...item, quantity } : item)))
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        await apiRemoveFromCart(itemId)
        fetchCart() // Tải lại giỏ hàng sau khi xóa
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
      } catch (error) {
        console.error("Error removing from cart:", error)
        toast.error("Không thể xóa sản phẩm")
      } finally {
        setLoading(false)
      }
    } else {
      // Xóa khỏi giỏ hàng cục bộ
      setCart((prevCart) => prevCart.filter((item) => item._id !== itemId))
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
    }
  }

  // Tính tổng giá trị giỏ hàng
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  // Tính tổng số lượng sản phẩm
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        // Gọi API để xóa toàn bộ giỏ hàng
        // Giả sử API này tồn tại
        await fetch("/api/cart/clear", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setCart([])
      } catch (error) {
        console.error("Error clearing cart:", error)
        toast.error("Không thể xóa giỏ hàng")
      } finally {
        setLoading(false)
      }
    } else {
      setCart([])
      localStorage.removeItem("cart")
    }
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
    clearCart,
    refreshCart: fetchCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
