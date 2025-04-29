"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext.jsx"

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // Hiển thị loading nếu đang kiểm tra trạng thái xác thực
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>
  }

  // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render các route con nếu đã xác thực
  return <Outlet />
}

export default ProtectedRoute
