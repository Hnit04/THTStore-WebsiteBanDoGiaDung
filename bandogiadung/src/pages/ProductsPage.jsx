// client/src/pages/ProductsPage.jsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useProducts } from "../hooks/useProducts.js"
import { useCategories } from "../hooks/useCategories.js"
import { formatCurrency, debounce } from "../lib/utils.js"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.jsx"
import AddProductModal from "../components/ui/AddProductModal.jsx"
import { Heart, ShoppingCart, Search } from "lucide-react"
import { useFavorites } from "../contexts/FavoritesContext.jsx"
import { useCart } from "../contexts/CartContext.jsx"
import toast from "react-hot-toast"

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const isAdmin = isAuthenticated && user && user.role === "admin"
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addToCart, cart, refreshCart } = useCart()

  const categoryParam = searchParams.get("category") || ""
  const searchParam = searchParams.get("search") || ""
  const minPriceParam = searchParams.get("minPrice") || "0"
  const maxPriceParam = searchParams.get("maxPrice") || "5000000"

  const [filters, setFilters] = useState({
    category: categoryParam,
    minPrice: parseInt(minPriceParam) || 0,
    maxPrice: parseInt(maxPriceParam) || 5000000,
    search: searchParam,
  })

  const [priceRange, setPriceRange] = useState([
    parseInt(minPriceParam) || 0,
    parseInt(maxPriceParam) || 5000000,
  ])
  const [isApplyingFilters, setIsApplyingFilters] = useState(false)
  const { products, loading: productsLoading, refetch } = useProducts(filters)
  const { categories, loading: categoriesLoading } = useCategories()
  const [viewMode, setViewMode] = useState("grid")

  const debouncedUpdateFilters = useMemo(
      () =>
          debounce((newFilters) => {
            setFilters(newFilters)
            const params = new URLSearchParams()
            if (newFilters.category) params.set("category", newFilters.category)
            if (newFilters.search) params.set("search", newFilters.search)
            if (newFilters.minPrice > 0) params.set("minPrice", newFilters.minPrice.toString())
            if (newFilters.maxPrice < 5000000) params.set("maxPrice", newFilters.maxPrice.toString())

            navigate(`?${params.toString()}`, { replace: true })
            setIsApplyingFilters(true)
            refetch(newFilters).finally(() => setIsApplyingFilters(false))
          }, 500),
      [navigate, refetch]
  )

  useEffect(() => {
    const newFilters = {
      category: categoryParam,
      minPrice: parseInt(minPriceParam) || 0,
      maxPrice: parseInt(maxPriceParam) || 5000000,
      search: searchParam,
    }

    if (
        newFilters.category !== filters.category ||
        newFilters.minPrice !== filters.minPrice ||
        newFilters.maxPrice !== filters.maxPrice ||
        newFilters.search !== filters.search
    ) {
      setFilters(newFilters)
      setPriceRange([newFilters.minPrice, newFilters.maxPrice])
      debouncedUpdateFilters(newFilters)
    }
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, debouncedUpdateFilters])

  const handleCategoryChange = useCallback(
      (categoryId) => {
        const newFilters = {
          ...filters,
          category: filters.category === categoryId ? "" : categoryId,
        }
        debouncedUpdateFilters(newFilters)
      },
      [filters, debouncedUpdateFilters]
  )

  const handlePriceChange = useCallback(() => {
    if (priceRange[0] > priceRange[1]) {
      toast.error("Giá tối thiểu không thể lớn hơn giá tối đa")
      return
    }
    const newFilters = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    }
    debouncedUpdateFilters(newFilters)
  }, [filters, priceRange, debouncedUpdateFilters])

  const handleSearchChange = useCallback(
      (e) => {
        const newFilters = {
          ...filters,
          search: e.target.value.trim(),
        }
        debouncedUpdateFilters(newFilters)
      },
      [filters, debouncedUpdateFilters]
  )

  const handleResetFilters = useCallback(() => {
    const newFilters = {
      category: "",
      minPrice: 0,
      maxPrice: 5000000,
      search: "",
    }
    setPriceRange([0, 5000000])
    setFilters(newFilters)
    navigate("", { replace: true })
    setIsApplyingFilters(true)
    refetch(newFilters).finally(() => setIsApplyingFilters(false))
  }, [navigate, refetch])

  const handleBuyNow = async (product) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng")
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    try {
      if (typeof product.stock === 'undefined' || product.stock < 1) {
        toast.error(`Sản phẩm ${product.name} đã hết hàng.`)
        return
      }

      console.log("Processing buy now for product _id:", product._id)
      let cartItem = cart.find((item) => item.product?._id === product._id)

      if (!cartItem) {
        console.log("Product not in cart, adding to cart with quantity 1")
        await addToCart(product._id, 1)
        console.log("Fetching updated cart")
        const updatedCart = await refreshCart()
        cartItem = updatedCart.find((item) => item.product?._id === product._id)
      } else {
        console.log("Product already in cart, checking quantity")
        if (typeof product.stock === 'undefined' || product.stock < cartItem.quantity + 1) {
          toast.error(`Sản phẩm ${product.name} chỉ còn ${product.stock || 0} đơn vị trong kho.`)
          return
        }
        console.log("Adding one more item to cart")
        await addToCart(product._id, 1)
        const updatedCart = await refreshCart()
        cartItem = updatedCart.find((item) => item.product?._id === product._id)
      }

      if (!cartItem) {
        throw new Error("Không thể tìm thấy sản phẩm trong giỏ hàng sau khi thêm")
      }

      const params = new URLSearchParams()
      params.append("items", cartItem._id)
      console.log("Navigating to checkout with cart item _id:", cartItem._id)
      navigate(`/checkout?${params.toString()}`)
    } catch (error) {
      console.error("Lỗi khi mua ngay:", error)
      toast.error("Đã xảy ra lỗi khi mua ngay. Vui lòng thử lại.")
    }
  }

  const handleAddToCart = async (productId) => {
    const product = products.find((p) => p._id === productId)
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    if (typeof product.stock === 'undefined' || product.stock < 1) {
      toast.error(`Sản phẩm ${product.name} đã hết hàng.`)
      return
    }
    try {
      await addToCart(productId, 1)
      await refreshCart()
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error)
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.")
    }
  }

  const handleToggleFavorite = (product) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích")
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    toggleFavorite(product)
  }

  return (
      <div className="container mx-auto px-4 py-12 font-sans">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">Tất Cả Sản Phẩm</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-semibold text-xl mb-4 text-gray-700">Tìm kiếm</h2>
              <div className="relative">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    value={filters.search}
                    onChange={handleSearchChange}
                    disabled={isApplyingFilters}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-semibold text-xl mb-4 text-gray-700">Danh mục</h2>
              {categoriesLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="h-6 bg-gray-100 rounded"></div>
                    ))}
                  </div>
              ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                        <div key={category._id} className="flex items-center">
                          <input
                              type="checkbox"
                              id={`category-${category._id}`}
                              checked={filters.category === category._id}
                              onChange={() => handleCategoryChange(category._id)}
                              className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              disabled={isApplyingFilters}
                          />
                          <label htmlFor={`category-${category._id}`} className="text-gray-600">
                            {category.name}
                          </label>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-semibold text-xl mb-4 text-gray-700">Giá</h2>
              <div className="mb-4">
                <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isApplyingFilters}
                />
                <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isApplyingFilters}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
              <button
                  onClick={handlePriceChange}
                  className={`w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all ${
                      isApplyingFilters ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isApplyingFilters}
              >
                {isApplyingFilters ? "Đang áp dụng..." : "Áp dụng"}
              </button>
            </div>

            <button
                onClick={handleResetFilters}
                className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-all ${
                    isApplyingFilters ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isApplyingFilters}
            >
              Đặt lại bộ lọc
            </button>
          </aside>

          <main className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-500">{products.length} sản phẩm</p>
              <div className="flex space-x-2">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"} hover:bg-red-500 hover:text-white transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"} hover:bg-red-500 hover:text-white transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {isAdmin && (
                <div className="mb-6">
                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-all"
                  >
                    Thêm sản phẩm
                  </button>
                  {isModalOpen && (
                      <AddProductModal
                          isOpen={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                          onAddProduct={(newProduct) => {
                            console.log("Sản phẩm mới:", newProduct)
                          }}
                      />
                  )}
                </div>
            )}

            {isApplyingFilters || productsLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-3 text-gray-700">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500 mb-6">Không có sản phẩm nào phù hợp với bộ lọc của bạn.</p>
                  <button
                      onClick={handleResetFilters}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    if (!product._id || typeof product._id !== "string") {
                      console.error("Invalid product ID:", product)
                      return null
                    }
                    return (
                        <div
                            key={product._id}
                            className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-gray-100 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:border-red-200"
                        >
                          <div className="relative">
                            <Link to={`/products/${product._id}`}>
                              <div className="h-56 overflow-hidden bg-gray-50">
                                <img
                                    src={product.image_url ? `/${product.image_url}` : "/placeholder.svg?height=400&width=400"}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                />
                              </div>
                            </Link>
                            <button
                                onClick={() => handleToggleFavorite(product)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
                            >
                              <Heart
                                  className={`w-5 h-5 ${isFavorite(product._id) ? "fill-red-600 text-red-600" : "text-gray-500"}`}
                              />
                            </button>
                          </div>
                          <div className="p-5">
                            <Link to={`/products/${product._id}`}>
                              <h3 className="font-semibold text-lg mb-2 text-gray-800 hover:text-red-600 transition-colors line-clamp-2">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-2">
                              Tồn kho: {typeof product.stock !== 'undefined' ? product.stock : 'Không xác định'}
                            </p>
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                {formatCurrency(product.price) && (
                                    <span className="font-bold text-red-600 text-lg">
                              {formatCurrency(product.price)}
                            </span>
                                )}
                                {formatCurrency(product.old_price) && (
                                    <span className="text-gray-400 text-sm line-through ml-2">
                              {formatCurrency(product.old_price)}
                            </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between gap-2">
                              <button
                                  onClick={() => handleBuyNow(product)}
                                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all w-1/2 ${
                                      product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  disabled={product.stock === 0}
                              >
                                Mua ngay
                              </button>
                              <button
                                  onClick={() => handleAddToCart(product._id)}
                                  className={`bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-all w-1/2 flex items-center justify-center ${
                                      product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  disabled={product.stock === 0}
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Thêm vào giỏ
                              </button>
                            </div>
                          </div>
                        </div>
                    )
                  })}
                </div>
            ) : (
                <div className="space-y-6">
                  {products.map((product) => {
                    if (!product._id || typeof product._id !== "string") {
                      console.error("Invalid product ID:", product)
                      return null
                    }
                    return (
                        <div
                            key={product._id}
                            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
                        >
                          <div className="flex flex-col md:flex-row items-stretch">
                            <div className="w-full md:w-1/3 relative bg-gray-50">
                              <Link to={`/products/${product._id}`}>
                                <img
                                    src={product.image_url ? `/${product.image_url}` : "/placeholder.svg?height=400&width=400"}
                                    alt={product.name}
                                    className="w-full h-48 md:h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                />
                              </Link>
                              <button
                                  onClick={() => handleToggleFavorite(product)}
                                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
                              >
                                <Heart
                                    className={`w-5 h-5 ${isFavorite(product._id) ? "fill-red-600 text-red-600" : "text-gray-500"}`}
                                />
                              </button>
                            </div>
                            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                              <div>
                                <Link to={`/products/${product._id}`}>
                                  <h3 className="font-semibold text-xl mb-2 text-gray-800 hover:text-red-600 transition-colors line-clamp-2">
                                    {product.name}
                                  </h3>
                                </Link>
                                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{product.description}</p>
                                <p className="text-gray-600 text-sm mb-2">
                                  Tồn kho: {typeof product.stock !== 'undefined' ? product.stock : 'Không xác định'}
                                </p>
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    {formatCurrency(product.price) && (
                                        <span className="font-bold text-red-600 text-lg">
                                  {formatCurrency(product.price)}
                                </span>
                                    )}
                                    {formatCurrency(product.old_price) && (
                                        <span className="text-gray-400 text-sm line-through ml-2">
                                  {formatCurrency(product.old_price)}
                                </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between gap-2">
                                <button
                                    onClick={() => handleBuyNow(product)}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all w-1/2 ${
                                        product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    disabled={product.stock === 0}
                                >
                                  Mua ngay
                                </button>
                                <button
                                    onClick={() => handleAddToCart(product._id)}
                                    className={`bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-all w-1/2 flex items-center justify-center ${
                                        product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    disabled={product.stock === 0}
                                >
                                  <ShoppingCart className="w-5 h-5 mr-1" />
                                  Thêm vào giỏ
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    )
                  })}
                </div>
            )}
          </main>
        </div>
      </div>
  )
}

export default ProductsPage