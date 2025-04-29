"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from "../lib/api.js"
import toast from "react-hot-toast"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi tải trang
    const checkAuthStatus = async () => {
      try {
        // Nếu có token trong localStorage, lấy thông tin user
        if (localStorage.getItem("token")) {
          const userData = await getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiLogin(email, password)
      setUser(data.user)

      return data
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại")
      toast.error(err.message || "Đăng nhập thất bại")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Đăng ký
  const register = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      setError(null)

      const userData = {
        email,
        password,
        fullName: metadata.full_name || "",
      }

      const data = await apiRegister(userData)

      toast.success("Đ��ng ký thành công! Vui lòng đăng nhập.")
      return data
    } catch (err) {
      setError(err.message || "Đăng ký thất bại")
      toast.error(err.message || "Đăng ký thất bại")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Đăng xuất
  const logout = async () => {
    try {
      setLoading(true)
      await apiLogout()
      setUser(null)
      toast.success("Đăng xuất thành công")
    } catch (err) {
      console.error("Error logging out:", err)
      toast.error("Đăng xuất thất bại")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
