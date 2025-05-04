// src/contexts/AuthContext.jsx
"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, verifyEmail as apiVerifyEmail } from "../lib/api.js"
import toast from "react-hot-toast"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
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

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.")
      return data
    } catch (err) {
      setError(err.message || "Đăng ký thất bại")
      toast.error(err.message || "Đăng ký thất bại")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (email, verificationCode) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`[Frontend] Verifying email: ${email} with code: ${verificationCode}`); // Log email và mã từ frontend

      const data = await apiVerifyEmail(email, verificationCode)

      console.log(`[Frontend] Verification successful for ${email}`);

      toast.success("Email đã được xác nhận thành công!")
      return data
    } catch (err) {
      console.error(`[Frontend] Verification failed for ${email}:`, err.message);
      setError(err.message || "Xác nhận email thất bại")
      toast.error(err.message || "Xác nhận email thất bại")
      throw err
    } finally {
      setLoading(false)
    }
  }

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
    verifyEmail,
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