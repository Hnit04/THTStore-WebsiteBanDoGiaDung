"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { supabase } from "../lib/supabase.js"
import toast from "react-hot-toast"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Kiểm tra phiên đăng nhập hiện tại
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error checking auth session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Lắng nghe sự thay đổi trạng thái xác thực
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })

      if (error) throw error

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.")
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
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
