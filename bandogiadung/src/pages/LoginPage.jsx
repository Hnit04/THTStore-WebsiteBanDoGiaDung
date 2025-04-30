"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.jsx"
import toast from "react-hot-toast"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Lấy redirect URL từ query params (nếu có)
  const searchParams = new URLSearchParams(location.search)
  const redirectTo = searchParams.get("redirect") || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    try {
      setIsSubmitting(true)
      await login(email, password)
      toast.success("Đăng nhập thành công")
      navigate(redirectTo)
    } catch (err) {
      toast.error(err.message || "Đã xảy ra lỗi, vui lòng thử lại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
          <p className="text-gray-600 text-center mb-6">Nhập thông tin đăng nhập của bạn để tiếp tục</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-gray-700">
                  Mật khẩu
                </label>
                <Link to="/forgot-password" className="text-sm text-red-600 hover:text-red-800">
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-red-600 hover:text-red-800 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
