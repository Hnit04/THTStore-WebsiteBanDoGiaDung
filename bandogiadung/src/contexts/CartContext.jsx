"use client";

import { createContext, useState, useContext, useEffect } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeFromCart as apiRemoveFromCart,
} from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]); // Xóa giỏ hàng khi không đăng nhập
    }
  }, [isAuthenticated, user]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await getCart();
      console.log("Dữ liệu giỏ hàng từ API:", data);
      const cartItems = Array.isArray(data) ? data : (data.items || []);
      if (!Array.isArray(cartItems)) {
        console.error("Dữ liệu giỏ hàng không phải mảng:", cartItems);
        setCart([]);
        return [];
      }
      setCart(cartItems);
      return cartItems;
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error.message);
      toast.error(`Không thể tải giỏ hàng: ${error.message}`);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      setLoading(true);
      await apiAddToCart(product._id || product.id, quantity);
      await fetchCart();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error.message);
      toast.error(`Không thể thêm vào giỏ hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
      return;
    }

    if (quantity < 1) return;

    try {
      setLoading(true);
      await updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng:", error.message);
      toast.error(`Không thể cập nhật giỏ hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng!");
      return;
    }

    try {
      setLoading(true);
      await apiRemoveFromCart(itemId);
      await fetchCart();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error.message);
      toast.error(`Không thể xóa sản phẩm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    if (!Array.isArray(cart)) {
      return 0;
    }
    return cart.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    if (!Array.isArray(cart)) {
      return 0;
    }
    return cart.length;
  };
  

  const clearCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xóa giỏ hàng!");
      return;
    }

    try {
      setLoading(true);
      await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCart([]);
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng:", error.message);
      toast.error(`Không thể xóa giỏ hàng: ${error.message}`);
    } finally {
      setLoading(false);
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