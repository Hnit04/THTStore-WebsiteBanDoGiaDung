"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useProducts } from "../hooks/useProducts.js"
import { useCategories } from "../hooks/useCategories.js"
import { formatCurrency } from "../lib/utils.js"
import { Link } from "react-router-dom"

// Simple debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get("category")
  const searchParam = searchParams.get("search")
  const minPriceParam = searchParams.get("minPrice")
  const maxPriceParam = searchParams.get("maxPrice")

  const [filters, setFilters] = useState({
    category: categoryParam || "",
    minPrice: minPriceParam ? Number.parseInt(minPriceParam) : 0,
    maxPrice: maxPriceParam ? Number.parseInt(maxPriceParam) : 5000000,
    search: searchParam || "",
  })

  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice])
  const { products, loading: productsLoading } = useProducts(filters)
  const { categories, loading: categoriesLoading } = useCategories()
  const [viewMode, setViewMode] = useState("grid")

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set("category", filters.category)
    if (filters.search) params.set("search", filters.search)
    if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString())
    if (filters.maxPrice < 5000000) params.set("maxPrice", filters.maxPrice.toString())

    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryId ? "" : categoryId, // Toggle single selection
    }))
  }

  const handlePriceChange = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    }))
  }

  // Debounced search handler
  const debouncedSearchChange = useCallback(
    debounce((value) => {
      setFilters((prev) => ({
        ...prev,
        search: value,
      }))
    }, 300),
    []
  )

  const handleSearchChange = (e) => {
    const value = e.target.value
    setFilters((prev) => ({ ...prev, search: value })) // Update input immediately
    debouncedSearchChange(value) // Debounced API call
  }

  const handleResetFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 5000000,
      search: "",
    })
    setPriceRange([0, 5000000])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tất Cả Sản Phẩm</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-black rounded-lg shadow p-4 mb-4">
            <h2 className="font-bold text-lg mb-4 text-white">Tìm kiếm</h2>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 border rounded-md"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="bg-black rounded-lg shadow p-4 mb-4">
            <h2 className="font-bold text-lg mb-4 text-white">Danh mục</h2>
            {categoriesLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={filters.category === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${category.id}`} className="text-white">{category.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black rounded-lg shadow p-4 mb-4">
            <h2 className="font-bold text-lg mb-4 text-white">Giá</h2>
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm mb-4 text-white">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
            <button onClick={handlePriceChange} className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-md">
              Áp dụng
            </button>
          </div>

          <button
            onClick={handleResetFilters}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        {/* Product List */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{products.length} sản phẩm</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H MOUSEMOVEDOWNTOUCHSTARTMOUSEMOVEDOWNTOUCHMOVEUPMOUSEMOVESELECTMOUSEOUTMOUSEOVERMOUSEUPDRAGSTARTDRAGENDDROP
                    d=M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {productsLoading ? (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : ""} gap-6`}>
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-80"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600 mb-4">Không có sản phẩm nào phù hợp với bộ lọc của bạn.</p>
              <button
                onClick={handleResetFilters}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden group">
                  <Link to={`/products/${product.id}`}>
                    <div className="h-48 overflow-hidden">
                      <img
                        src={product.image_url || "/placeholder.svg?height=400&width=400"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-medium text-lg mb-2 hover:text-red-600 transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-red-600">{formatCurrency(product.price)}</span>
                        {product.old_price && (
                          <span className="text-gray-500 text-sm line-through ml-2">
                            {formatCurrency(product.old_price)}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.image_url || "/placeholder.svg?height=400&width=400"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </div>
                    <div className="w-full md:w-2/3 p-6">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-medium text-xl mb-2 hover:text-red-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-red-600 text-xl">{formatCurrency(product.price)}</span>
                          {product.old_price && (
                            <span className="text-gray-500 text-sm line-through ml-2">
                              {formatCurrency(product.old_price)}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/products/${product.id}`}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage