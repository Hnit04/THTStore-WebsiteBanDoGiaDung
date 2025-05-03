
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getProductById } from "../lib/api.js"
import { formatCurrency } from "../lib/utils.js"
import { useCart } from "../contexts/CartContext.jsx"
import toast from "react-hot-toast"
import { useAuth } from "../contexts/AuthContext.jsx"
import  UpdateProductModal from "../components/ui/UpdateProductModal.jsx"
function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const isAdmin = isAuthenticated && user && user.role === "admin"
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const data = await getProductById(id)
        setProduct(data)
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sản phẩm")
        console.error("Error loading product:", err)
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [id])

  
  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 bg-gray-200 rounded-lg h-96"></div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
        <p className="text-gray-600 mb-6">{error || "Không tìm thấy sản phẩm"}</p>
        <Link to="/products" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại danh sách sản phẩm
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={"/" +product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
          
        </div>

        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 ${i < product.rating ? "fill-yellow-400" : "fill-gray-300"}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">{product.review_count || 0} đánh giá</span>
          </div>

          <div className="text-2xl font-bold text-red-600 mb-4">
            {formatCurrency(product.price)}
            {product.old_price && (
              <span className="text-gray-500 text-lg line-through ml-2">{formatCurrency(product.old_price)}</span>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Số lượng:</label>
            <div className="flex items-center">
              <button
                className="border border-gray-300 rounded-l-md px-3 py-1"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="border-t border-b border-gray-300 px-4 py-1">{quantity}</span>
              <button
                className="border border-gray-300 rounded-r-md px-3 py-1"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {isAdmin ? (
            <div>
              <button
            className="w-full mb-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium" 
            onClick={() => setIsModalOpen(true)}
          >
            Cập nhật sản phẩm
          </button>
          <UpdateProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={product}
          />

            </div>

          ):(
            <button
            className="w-full mb-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </button>
          )}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Giao hàng miễn phí cho đơn hàng từ 500.000₫</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Bảo hành 12 tháng chính hãng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
