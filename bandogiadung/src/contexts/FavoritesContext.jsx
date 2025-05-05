"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext.jsx"
import toast from "react-hot-toast"

// Tạo context
const FavoritesContext = createContext()

// Provider để quản lý danh sách yêu thích
export function FavoritesProvider({ children }) {
    const { isAuthenticated, user } = useAuth()
    // Khởi tạo state từ localStorage (nếu có)
    const [favorites, setFavorites] = useState([])

    // Tải danh sách yêu thích khi người dùng đăng nhập/đăng xuất
    useEffect(() => {
        if (isAuthenticated && user) {
            // Nếu đã đăng nhập, tải danh sách yêu thích từ localStorage với key là userId
            const userFavorites = localStorage.getItem(`favorites_${user.id}`)
            setFavorites(userFavorites ? JSON.parse(userFavorites) : [])
        } else {
            // Nếu chưa đăng nhập, danh sách yêu thích trống
            setFavorites([])
        }
    }, [isAuthenticated, user])

    // Lưu favorites vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (isAuthenticated && user) {
            localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))
        }
    }, [favorites, isAuthenticated, user])

    // Hàm để thêm hoặc xóa sản phẩm khỏi danh sách yêu thích
    const toggleFavorite = (product) => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích")
            return false
        }

        setFavorites((prev) => {
            if (prev.some((p) => p.id === product.id)) {
                toast.success(`Đã xóa ${product.name} khỏi danh sách yêu thích`)
                return prev.filter((p) => p.id !== product.id)
            } else {
                toast.success(`Đã thêm ${product.name} vào danh sách yêu thích`)
                return [...prev, product]
            }
        })
        return true
    }

    // Hàm để kiểm tra xem sản phẩm có trong danh sách yêu thích không
    const isFavorite = (productId) => {
        return favorites.some((p) => p.id === productId)
    }

    // Hàm để xóa toàn bộ danh sách yêu thích
    const clearFavorites = () => {
        setFavorites([])
        if (isAuthenticated && user) {
            localStorage.removeItem(`favorites_${user.id}`)
        }
    }

    // Giá trị được cung cấp qua context
    const value = {
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
    }

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// Hook để sử dụng FavoritesContext
export const useFavorites = () => {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider")
    }
    return context
}
