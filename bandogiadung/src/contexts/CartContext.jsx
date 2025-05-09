// client/src/contexts/CartContext.jsx
"use client";

import { createContext, useState, useContext, useEffect } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  getProductById,
} from "../lib/api.js";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [localCart, setLocalCart] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      const currentLocalCart = [...cart];
      fetchCart().then(() => {
        if (currentLocalCart.length > 0) {
          mergeLocalCartWithServerCart(currentLocalCart);
        }
      });
    } else {
      const savedLocalCart = localStorage.getItem("cart");
      if (savedLocalCart) {
        try {
          setCart(JSON.parse(savedLocalCart));
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
          setCart([]);
        }
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated && cart.length >= 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const mergeLocalCartWithServerCart = async (localCartItems) => {
    try {
      setLoading(true);
      for (const item of localCartItems) {
        await apiAddToCart(item.product._id || item.product.id, item.quantity);
      }
      await fetchCart();
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Error merging carts:", error);
      toast.error(error.message || "Không thể hợp nhất giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!isAuthenticated) return [];

    try {
      setLoading(true);
      const data = await getCart();
      console.log("Dữ liệu giỏ hàng từ API:", data);

      let cartItems = [];
      if (Array.isArray(data)) {
        cartItems = data;
      } else if (data && Array.isArray(data.data)) {
        cartItems = data.data;
      } else if (data && data.items && Array.isArray(data.items)) {
        cartItems = data.items;
      } else {
        console.error("Dữ liệu giỏ hàng không đúng định dạng:", data);
        cartItems = [];
      }

      setCart(cartItems);
      return cartItems;
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error.message || error);
      toast.error(error.message || "Không thể tải giỏ hàng");
      setCart([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        if (!productId) {
          throw new Error("ID sản phẩm không hợp lệ");
        }

        const product = await getProductById(productId);
        if (!product || typeof product.stock === "undefined" || product.stock < quantity) {
          throw new Error(`Sản phẩm ${product.name || "này"} chỉ còn ${product.stock || 0} đơn vị trong kho.`);
        }

        const existingItem = cart.find((item) => item.product._id === productId);
        if (existingItem && existingItem.quantity + quantity > product.stock) {
          throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.stock} đơn vị trong kho.`);
        }

        await apiAddToCart(productId, quantity);
        const updatedCart = await fetchCart();
        toast.success("Đã thêm vào giỏ hàng");
        return updatedCart;
      } catch (error) {
        console.error("Lỗi thêm vào giỏ hàng:", error.message || error);
        toast.error(error.message || "Không thể thêm vào giỏ hàng");
        return null;
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
            (item) => (item.product._id && item.product._id === productId) || (item.product.id && item.product.id === productId)
        );

        if (existingItemIndex >= 0) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += quantity;
          return updatedCart;
        } else {
          return [
            ...prevCart,
            {
              id: `local-${Date.now()}`,
              product: { _id: productId },
              quantity,
            },
          ];
        }
      });
      toast.success("Đã thêm vào giỏ hàng");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        setLoading(true);
        const item = cart.find((item) => item._id === itemId);
        if (!item) {
          throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
        }

        const product = await getProductById(item.product._id);
        if (!product || typeof product.stock === "undefined" || product.stock < quantity) {
          throw new Error(`Sản phẩm ${product.name || "này"} chỉ còn ${product.stock || 0} đơn vị trong kho.`);
        }

        await updateCartItem(itemId, quantity);
        await fetchCart();
        toast.success("Đã cập nhật số lượng");
      } catch (error) {
        console.error("Lỗi cập nhật giỏ hàng:", error.message || error);
        toast.error(error.message || "Không thể cập nhật giỏ hàng");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
      toast.success("Đã cập nhật số lượng");
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await apiRemoveFromCart(itemId);
        await fetchCart();
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error.message || error);
        toast.error(error.message || "Không thể xóa sản phẩm");
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const getCartTotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return 0;
    }
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const getCartCount = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return 0;
    }
    return cart.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await apiClearCart();
        setCart([]);
        toast.success("Đã xóa giỏ hàng");
      } catch (error) {
        console.error("Lỗi xóa giỏ hàng:", error.message || error);
        toast.error(error.message || "Không thể xóa giỏ hàng");
      } finally {
        setLoading(false);
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart");
      toast.success("Đã xóa giỏ hàng");
    }
  };

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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart phải được dùng trong CartProvider");
  }
  return context;
};