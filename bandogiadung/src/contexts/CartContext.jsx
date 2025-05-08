"use client"

import { createContext, useState, useContext, useEffect } from "react"
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from "../lib/api.js"
import { useAuth } from "./AuthContext" // Sửa đường dẫn import - bỏ .jsx
import toast from "react-hot-toast"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const [localCart, setLocalCart] = useState([])

  // Tải giỏ hàng khi người dùng đăng nhập/đăng xuất
  useEffect(() => {
    if (isAuthenticated) {
      // Lưu giỏ hàng cục bộ trước khi tải giỏ hàng từ server
      const currentLocalCart = [...cart]

      // Tải giỏ hàng từ server
      fetchCart().then(() => {
        // Sau khi tải giỏ hàng từ server, hợp nhất với giỏ hàng cục bộ
        if (currentLocalCart.length > 0) {
          mergeLocalCartWithServerCart(currentLocalCart)
        }
      })
    } else {
      // Nếu không đăng nhập, tải giỏ hàng từ localStorage
      const savedLocalCart = localStorage.getItem("cart")
      if (savedLocalCart) {
        try {
          setCart(JSON.parse(savedLocalCart))
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error)
          setCart([])
        }
      }
    }
  }, [isAuthenticated, user])

  // Lưu giỏ hàng vào localStorage khi không đăng nhập
  useEffect(() => {
    if (!isAuthenticated && cart.length >= 0) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, isAuthenticated])

  // Hợp nhất giỏ hàng cục bộ với giỏ hàng từ server
  const mergeLocalCartWithServerCart = async (localCartItems) => {
    try {
      setLoading(true)
      // Thêm từng sản phẩm từ giỏ hàng cục bộ vào giỏ hàng server
      for (const item of localCartItems) {
        await apiAddToCart(item.product._id || item.product.id, item.quantity)
      }
      // Sau khi thêm tất cả, tải lại giỏ hàng từ server
      await fetchCart()
      // Xóa giỏ hàng cục bộ
      localStorage.removeItem("cart")
    } catch (error) {
      console.error("Error merging carts:", error)
    } finally {
      setLoading(false)
    }
  }

  // Tải giỏ hàng từ API
  const fetchCart = async () => {
    if (!isAuthenticated) return []

    try {
      setLoading(true)
      const data = await getCart()
      console.log("Dữ liệu giỏ hàng từ API:", data)

      // Chuẩn hóa dữ liệu trả về
      let cartItems = []
      if (Array.isArray(data)) {
        cartItems = data
      } else if (data && Array.isArray(data.data)) {
        cartItems = data.data
      } else if (data && data.items && Array.isArray(data.items)) {
        cartItems = data.items
      } else {
        console.error("Dữ liệu giỏ hàng không đúng định dạng:", data)
        cartItems = []
      }

      setCart(cartItems)
      return cartItems
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error.message || error)
      toast.error(`Không thể tải giỏ hàng: ${error.message || "Lỗi không xác định"}`)
      setCart([])
      return []
    } finally {
      setLoading(false)
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (productId, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        console.log("Sending addToCart request with product _id:", productId)

        // Thêm xử lý lỗi chi tiết
        if (!productId) {
          throw new Error("ID sản phẩm không hợp lệ")
        }

        const result = await apiAddToCart(productId, quantity)
        console.log("Kết quả thêm vào giỏ hàng:", result)

        // Đảm bảo fetchCart hoàn thành trước khi hiển thị thông báo
        const updatedCart = await fetchCart()
        toast.success("Đã thêm vào giỏ hàng")
        return updatedCart
      } catch (error) {
        console.error("Lỗi thêm vào giỏ hàng:", error.message || error)
        toast.error(`Không thể thêm vào giỏ hàng: ${error.message || "Lỗi không xác định"}`)
        return null
      } finally {
        setLoading(false)
      }
    } else {
      // Xử lý giỏ hàng cục bộ khi không đăng nhập
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
            (item) =>
                (item.product._id && item.product._id === productId) || (item.product.id && item.product.id === productId),
        )

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
              id: `local-${Date.now()}`,
              product: { _id: productId },
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
        await fetchCart()
      } catch (error) {
        console.error("Lỗi cập nhật giỏ hàng:", error.message || error)
        toast.error(`Không thể cập nhật giỏ hàng: ${error.message || "Lỗi không xác định"}`)
      } finally {
        setLoading(false)
      }
    } else {
      // Cập nhật giỏ hàng cục bộ
      setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        await apiRemoveFromCart(itemId)
        await fetchCart()
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error.message || error)
        toast.error(`Không thể xóa sản phẩm: ${error.message || "Lỗi không xác định"}`)
      } finally {
        setLoading(false)
      }
    } else {
      // Xóa khỏi giỏ hàng cục bộ
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
    }
  }

  // Tính tổng giá trị giỏ hàng
  const getCartTotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return 0
    }
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0
      const quantity = item.quantity || 0
      return total + price * quantity
    }, 0)
  }

  // Tính tổng số lượng sản phẩm
  const getCartCount = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return 0
    }
    return cart.reduce((count, item) => count + (item.quantity || 0), 0)
  }

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        await apiClearCart()
        setCart([])
        toast.success("Đã xóa giỏ hàng")
      } catch (error) {
        console.error("Lỗi xóa giỏ hàng:", error.message || error)
        toast.error(`Không thể xóa giỏ hàng: ${error.message || "Lỗi không xác định"}`)
      } finally {
        setLoading(false)
      }
    } else {
      setCart([])
      localStorage.removeItem("cart")
      toast.success("Đã xóa giỏ hàng")
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
    throw new Error("useCart phải được dùng trong CartProvider")
  }
  return context
}
