// src/pages/RegisterPage.jsx
"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.jsx"
import toast from "react-hot-toast"

function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const { register, verifyEmail, error } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    try {
      setIsSubmitting(true)
      await register(email, password, { full_name: fullName })
      setShowVerification(true)
    } catch (err) {
      toast.error(err.message || "Đã xảy ra lỗi, vui lòng thử lại")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()

    if (!verificationCode) {
      toast.error("Vui lòng nhập mã xác nhận")
      return
    }

    try {
      setIsSubmitting(true)
      await verifyEmail(email, verificationCode)
      navigate("/login")
    } catch (err) {
      toast.error(err.message || "Xác nhận email thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              {showVerification ? "Xác nhận Email" : "Đăng ký tài khoản"}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {showVerification
                  ? "Vui lòng nhập mã xác nhận đã được gửi đến email của bạn"
                  : "Tạo tài khoản mới để mua sắm tại HomeGoods"}
            </p>

            {!showVerification ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                  </div>

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
                    <label htmlFor="password" className="block text-gray-700 mb-2">
                      Mật khẩu
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}

                  <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <label htmlFor="verificationCode" className="block text-gray-700 mb-2">
                      Mã xác nhận
                    </label>
                    <input
                        id="verificationCode"
                        type="text"
                        placeholder="Nhập mã xác nhận"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                    />
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}

                  <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
                  </button>
                </form>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600 text-center">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-red-600 hover:text-red-800 font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}

export default RegisterPage