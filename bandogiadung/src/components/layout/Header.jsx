"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Search, Menu, X, User, Heart } from "lucide-react"
import { useCart } from "../../contexts/CartContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"

function Header() {
  const { getCartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  // Kiểm tra xem người dùng có phải là admin không
  const isAdmin = isAuthenticated && user && user.role === "admin"

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  // Định nghĩa các liên kết dựa trên vai trò
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { to: "/admin/products", label: "Sản phẩm" },
        { to: "/admin/customers", label: "Khách hàng" },
        { to: "/admin/orders", label: "Hóa đơn" },
        { to: "/admin/statistics", label: "Thống kê" },
      ]
    } else {
      return [
        { to: "/", label: "Trang chủ" },
        { to: "/products", label: "Sản phẩm" },
        { to: "/about", label: "Giới thiệu" },
        { to: "/contact", label: "Liên hệ" },
      ]
    }
  }

  const navLinks = getNavLinks()

  return (
    <header className="bg-gray-900 w-screen shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">{isAdmin ? "HomeGoods Admin" : "HomeGoods"}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-white hover:text-white/80 font-medium">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search, Cart, User (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-64 pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white-600 focus:border-transparent text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
            </form>

            {!isAdmin && (
              <button className="p-2 rounded-full hover:bg-gray-700 relative text-white">
                <Heart className="w-5 h-5" />
              </button>
            )}

            {!isAdmin && (
              <Link to="/cart" className="p-2 rounded-full hover:bg-gray-700 relative text-white">
                <ShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-700 text-white">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 w-56 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    Xin chào, {user.fullName}
                    {isAdmin && <span className="ml-1 text-xs font-semibold text-red-600">(Admin)</span>}
                  </div>

                  {isAdmin ? (
                    // Menu cho admin
                    <>
                      <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                        Thông tin cá nhân
                      </Link>
                      <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                        Cài đặt hệ thống
                      </Link>
                    </>
                  ) : (
                    // Menu cho người dùng thông thường
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                        Thông tin cá nhân
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                        Đơn hàng của tôi
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-2 rounded-full hover:bg-gray-700 text-white">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            {!isAdmin && (
              <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
                <ShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </form>

            <nav className="flex flex-col space-y-4">
              {/* Hiển thị các liên kết dựa trên vai trò */}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    // Menu cho admin trên mobile
                    <>
                      <Link
                        to="/admin/profile"
                        className="text-gray-700 hover:text-red-600 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="text-gray-700 hover:text-red-600 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Cài đặt hệ thống
                      </Link>
                    </>
                  ) : (
                    // Menu cho người dùng thông thường trên mobile
                    <>
                      <Link
                        to="/profile"
                        className="text-gray-700 hover:text-red-600 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/orders"
                        className="text-gray-700 hover:text-red-600 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Đơn hàng của tôi
                      </Link>
                    </>
                  )}
                  <button
                    className="text-left text-gray-700 hover:text-red-600 font-medium py-2"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
