"use client"

import { Link } from "react-router-dom"
import { useCart } from "../contexts/CartContext.jsx"
import { formatCurrency } from "../lib/utils.js"
import { useAuth } from "../contexts/AuthContext.jsx"

function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()

  const subtotal = getCartTotal()
  const shipping = subtotal > 500000 ? 0 : 30000
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>
        <p className="text-gray-600 mb-8">Giỏ hàng của bạn đang trống.</p>
        <Link to="/products" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium">
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">Sản phẩm</th>
                  <th className="py-4 px-6 text-center">Số lượng</th>
                  <th className="py-4 px-6 text-right">Giá</th>
                  <th className="py-4 px-6 text-right">Tổng</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <img
                          src={item.product.image_url || "/placeholder.svg?height=80&width=80"}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="ml-4">
                          <Link
                            to={`/products/${item.product.id}`}
                            className="font-medium text-gray-900 hover:text-red-600"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          className="border border-gray-300 rounded-l-md px-3 py-1"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span className="border-t border-b border-gray-300 px-4 py-1">{item.quantity}</span>
                        <button
                          className="border border-gray-300 rounded-r-md px-3 py-1"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">{formatCurrency(item.product.price)}</td>
                    <td className="py-4 px-6 text-right font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Link to="/products" className="border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded-md font-medium">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Link
                  to="/checkout"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-md font-medium"
                >
                  Tiến hành thanh toán
                </Link>
              ) : (
                <Link
                  to="/login?redirect=checkout"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-md font-medium"
                >
                  Đăng nhập để thanh toán
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
