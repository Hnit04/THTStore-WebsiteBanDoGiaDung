import { Link } from "react-router-dom"

function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-6">Trang không tồn tại</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium inline-block">
        Quay lại trang chủ
      </Link>
    </div>
  )
}

export default NotFoundPage
