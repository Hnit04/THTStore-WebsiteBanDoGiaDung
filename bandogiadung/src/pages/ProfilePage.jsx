"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext.jsx"
import { getUserOrders } from "../lib/api.js"
import { formatCurrency, formatDate } from "../lib/utils.js"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { updateUserProfile } from "../lib/api.js"

function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
        ward: user.ward || "",
      })
    }
  }, [user])

  // Lấy lịch sử đơn hàng
  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders()
    }
  }, [activeTab, user])

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const data = await getUserOrders()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Không thể tải lịch sử đơn hàng")
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Gọi API cập nhật thông tin người dùng
      await updateUserProfile(formData)
      window.location.reload() // Tải lại trang để cập nhật thông tin
      toast.success("Cập nhật thông tin thành công")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Đã xảy ra lỗi khi cập nhật thông tin")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const currentPassword = e.target.currentPassword.value
    const newPassword = e.target.newPassword.value
    const confirmPassword = e.target.confirmPassword.value

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("người dùng", user)
      // Gọi API đổi mật khẩu
      const response = await fetch("http://localhost:5000/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Không thể đổi mật khẩu")
      }

      toast.success("Đổi mật khẩu thành công")

      // Reset form
      e.target.reset()
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error(error.message || "Đã xảy ra lỗi khi đổi mật khẩu")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h1>
        <p className="mb-6">Vui lòng đăng nhập để xem thông tin cá nhân</p>
        <Link to="/login" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tài khoản của tôi</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-2xl font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="font-bold">{user.fullName || "Người dùng"}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === "profile" ? "bg-red-600 text-white" : "hover:bg-gray-100"
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === "orders" ? "bg-red-600 text-white" : "hover:bg-gray-100"
                }`}
              >
                Lịch sử đơn hàng
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === "password" ? "bg-red-600 text-white" : "hover:bg-gray-100"
                }`}
              >
                Đổi mật khẩu
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {/* Thông tin cá nhân */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-2 border rounded-md bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="block text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="ward" className="block text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </button>
              </form>
            </div>
          )}

          {/* Lịch sử đơn hàng */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Lịch sử đơn hàng</h2>

              {loadingOrders ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
                  <Link to="/products" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">
                    Mua sắm ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Đơn hàng #{order._id.substring(0, 8)}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Chờ xác nhận"
                            : order.status === "processing"
                              ? "Đang xử lý"
                              : order.status === "shipped"
                                ? "Đang giao hàng"
                                : order.status === "delivered"
                                  ? "Đã giao hàng"
                                  : "Đã hủy"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Ngày đặt: {formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-600 mb-2">Địa chỉ giao hàng: {order.shippingAddress}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Phương thức thanh toán:{" "}
                        {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản ngân hàng"}
                      </p>

                      <div className="border-t pt-2">
                        <p className="font-medium">Sản phẩm:</p>
                        <ul className="divide-y">
                          {order.items.map((item, index) => (
                            <li key={index} className="py-2 flex justify-between">
                              <span>
                                {item.productName} x{item.quantity}
                              </span>
                              <span className="font-medium">{formatCurrency(item.productPrice * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                          <span>Tổng cộng:</span>
                          <span className="text-red-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Đổi mật khẩu */}
          {activeTab === "password" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    minLength="6"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    minLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
