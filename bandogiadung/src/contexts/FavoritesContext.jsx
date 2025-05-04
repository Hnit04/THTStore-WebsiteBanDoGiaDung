"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Tạo context
const FavoritesContext = createContext()

// Provider để quản lý danh sách yêu thích
export function FavoritesProvider({ children }) {
    // Khởi tạo state từ localStorage (nếu có)
    const [favorites, setFavorites] = useState(() => {
        if (typeof window !== "undefined") {
            const savedFavorites = localStorage.getItem("favorites")
            return savedFavorites ? JSON.parse(savedFavorites) : []
        }
        return []
    })

    // Lưu favorites vào localStorage mỗi khi thay đổi
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites))
    }, [favorites])

    // Hàm để thêm hoặc xóa sản phẩm khỏi danh sách yêu thích
    const toggleFavorite = (product) => {
        setFavorites((prev) => {
            if (prev.some((p) => p.id === product.id)) {
                return prev.filter((p) => p.id !== product.id)
            } else {
                return [...prev, product]
            }
        })
    }

    // Hàm để kiểm tra xem sản phẩm có trong danh sách yêu thích không
    const isFavorite = (productId) => {
        return favorites.some((p) => p.id === productId)
    }

    // Hàm để xóa toàn bộ danh sách yêu thích
    const clearFavorites = () => {
        setFavorites([])
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
