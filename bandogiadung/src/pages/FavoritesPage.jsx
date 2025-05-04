"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useFavorites } from "../contexts/FavoritesContext.jsx"
import { useCart } from "../contexts/CartContext.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"
import { formatCurrency } from "../lib/utils.js"
import {
    Heart,
    ShoppingCart,
    Trash2,
    Grid3X3,
    List,
    Share2,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    LogIn,
} from "lucide-react"
import toast from "react-hot-toast"
import EmptyState from "../components/ui/EmptyState.jsx"

function FavoritesPage() {
    const navigate = useNavigate()
    const { favorites, toggleFavorite, clearFavorites } = useFavorites()
    const { addToCart } = useCart()
    const { isAuthenticated } = useAuth()
    const [viewMode, setViewMode] = useState("grid")
    const [sortBy, setSortBy] = useState("default")
    const [showSortOptions, setShowSortOptions] = useState(false)
    const [sortedFavorites, setSortedFavorites] = useState([])
    const [selectedItems, setSelectedItems] = useState([])
    const [isSelectMode, setIsSelectMode] = useState(false)

    // Chuyển hướng người dùng đến trang đăng nhập nếu chưa đăng nhập
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để xem danh sách yêu thích")
            navigate("/login?redirect=/favorites")
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        const sorted = [...favorites]

        switch (sortBy) {
            case "price-asc":
                sorted.sort((a, b) => a.price - b.price)
                break
            case "price-desc":
                sorted.sort((a, b) => b.price - a.price)
                break
            case "name-asc":
                sorted.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "name-desc":
                sorted.sort((a, b) => b.name.localeCompare(a.name))
                break
            case "date-added":
            default:
                // Assume favorites are already sorted by date added
                break
        }

        setSortedFavorites(sorted)
    }, [favorites, sortBy])

    const handleBuyNow = (product) => {
        addToCart(product, 1)
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
        navigate("/cart")
    }

    const handleRemoveAll = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?")) {
            clearFavorites()
            toast.success("Đã xóa tất cả sản phẩm yêu thích")
        }
    }

    const handleRemoveSelected = () => {
        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất một sản phẩm")
            return
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
            selectedItems.forEach((id) => {
                const product = favorites.find((p) => p.id === id)
                if (product) toggleFavorite(product)
            })
            setSelectedItems([])
            setIsSelectMode(false)
            toast.success("Đã xóa các sản phẩm đã chọn")
        }
    }

    const handleAddAllToCart = () => {
        favorites.forEach((product) => {
            addToCart(product, 1)
        })
        toast.success(`Đã thêm ${favorites.length} sản phẩm vào giỏ hàng`)
    }

    const handleAddSelectedToCart = () => {
        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất một sản phẩm")
            return
        }

        selectedItems.forEach((id) => {
            const product = favorites.find((p) => p.id === id)
            if (product) addToCart(product, 1)
        })
        toast.success(`Đã thêm ${selectedItems.length} sản phẩm vào giỏ hàng`)
    }

    const toggleSelectItem = (productId) => {
        setSelectedItems((prev) =>
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
        )
    }

    const toggleSelectAll = () => {
        if (selectedItems.length === favorites.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(favorites.map((p) => p.id))
        }
    }

    const sortOptions = [
        { value: "default", label: "Mặc định" },
        { value: "price-asc", label: "Giá: Thấp đến cao" },
        { value: "price-desc", label: "Giá: Cao đến thấp" },
        { value: "name-asc", label: "Tên: A-Z" },
        { value: "name-desc", label: "Tên: Z-A" },
    ]

    // Nếu chưa đăng nhập, hiển thị màn hình đăng nhập
    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                    <EmptyState
                        title="Vui lòng đăng nhập"
                        description="Bạn cần đăng nhập để xem và quản lý danh sách yêu thích của mình."
                        icon={<LogIn className="w-20 h-20 text-gray-300" />}
                        actionText="Đăng nhập ngay"
                        actionHref="/login?redirect=/favorites"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 font-sans">
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Sản Phẩm Yêu Thích</h1>
            </div>

            {favorites.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <EmptyState
                        title="Danh sách yêu thích trống"
                        description="Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá các sản phẩm và thêm vào danh sách yêu thích của bạn."
                        icon={<Heart className="w-20 h-20 text-gray-300" />}
                        actionText="Khám phá sản phẩm"
                        actionHref="/products"
                    />
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="flex items-center">
                                <p className="text-gray-600 font-medium">
                                    <span className="text-red-600 font-bold">{favorites.length}</span> sản phẩm yêu thích
                                </p>
                                {isSelectMode && (
                                    <p className="ml-4 text-gray-600 font-medium">
                                        Đã chọn: <span className="text-red-600 font-bold">{selectedItems.length}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {isSelectMode ? (
                                    <>
                                        <button
                                            onClick={toggleSelectAll}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                                        >
                                            {selectedItems.length === favorites.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                        </button>
                                        <button
                                            onClick={handleAddSelectedToCart}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                            Thêm vào giỏ
                                        </button>
                                        <button
                                            onClick={handleRemoveSelected}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Xóa đã chọn
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSelectMode(false)
                                                setSelectedItems([])
                                            }}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowSortOptions(!showSortOptions)}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center"
                                            >
                                                Sắp xếp: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                                                {showSortOptions ? (
                                                    <ChevronUp className="w-4 h-4 ml-1" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </button>

                                            {showSortOptions && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                                                    {sortOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                setSortBy(option.value)
                                                                setShowSortOptions(false)
                                                            }}
                                                            className={`block w-full text-left px-4 py-2 text-sm ${sortBy === option.value ? "bg-gray-100 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setIsSelectMode(true)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                                        >
                                            Chọn nhiều
                                        </button>

                                        <button
                                            onClick={handleAddAllToCart}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                            Thêm tất cả vào giỏ
                                        </button>

                                        <button
                                            onClick={handleRemoveAll}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Xóa tất cả
                                        </button>

                                        <div className="flex space-x-2 ml-2">
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"} hover:bg-red-500 hover:text-white transition-all`}
                                            >
                                                <Grid3X3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"} hover:bg-red-500 hover:text-white transition-all`}
                                            >
                                                <List className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedFavorites.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 ${
                                            isSelectMode && selectedItems.includes(product.id)
                                                ? "border-red-500"
                                                : "border-gray-100 hover:border-red-200"
                                        }`}
                                    >
                                        <div className="relative">
                                            {isSelectMode && (
                                                <div
                                                    className="absolute top-0 left-0 w-full h-full bg-black/5 z-10 flex items-center justify-center"
                                                    onClick={() => toggleSelectItem(product.id)}
                                                >
                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                            selectedItems.includes(product.id)
                                                                ? "bg-red-600 border-red-600"
                                                                : "bg-white/80 border-gray-400"
                                                        }`}
                                                    >
                                                        {selectedItems.includes(product.id) && (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-white"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <Link to={`/products/${product.id}`} className={isSelectMode ? "pointer-events-none" : ""}>
                                                <div className="h-56 overflow-hidden bg-gray-50">
                                                    <img
                                                        src={product.image_url || "/placeholder.svg?height=400&width=400"}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                            </Link>

                                            {!isSelectMode && (
                                                <button
                                                    onClick={() => toggleFavorite(product)}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
                                                >
                                                    <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <Link to={`/products/${product.id}`} className={isSelectMode ? "pointer-events-none" : ""}>
                                                <h3 className="font-semibold text-lg mb-2 text-gray-800 hover:text-red-600 transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <span className="font-bold text-red-600 text-lg">{formatCurrency(product.price)}</span>
                                                    {product.old_price && (
                                                        <span className="text-gray-400 text-sm line-through ml-2">
                              {formatCurrency(product.old_price)}
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            {!isSelectMode && (
                                                <div className="flex justify-between gap-2">
                                                    <button
                                                        onClick={() => handleBuyNow(product)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all w-1/2"
                                                    >
                                                        Mua ngay
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            addToCart(product, 1)
                                                            toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
                                                        }}
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-all w-1/2 flex items-center justify-center"
                                                    >
                                                        <ShoppingCart className="w-4 h-4 mr-1" />
                                                        Thêm vào giỏ
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sortedFavorites.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                            isSelectMode && selectedItems.includes(product.id)
                                                ? "border-2 border-red-500"
                                                : "border border-gray-100"
                                        }`}
                                    >
                                        <div className="flex flex-col md:flex-row items-stretch">
                                            <div className="w-full md:w-1/3 relative bg-gray-50">
                                                {isSelectMode && (
                                                    <div
                                                        className="absolute top-0 left-0 w-full h-full bg-black/5 z-10 flex items-center justify-center"
                                                        onClick={() => toggleSelectItem(product.id)}
                                                    >
                                                        <div
                                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                                selectedItems.includes(product.id)
                                                                    ? "bg-red-600 border-red-600"
                                                                    : "bg-white/80 border-gray-400"
                                                            }`}
                                                        >
                                                            {selectedItems.includes(product.id) && (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4 text-white"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <Link to={`/products/${product.id}`} className={isSelectMode ? "pointer-events-none" : ""}>
                                                    <img
                                                        src={product.image_url || "/placeholder.svg?height=400&width=400"}
                                                        alt={product.name}
                                                        className="w-full h-48 md:h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                                    />
                                                </Link>

                                                {!isSelectMode && (
                                                    <button
                                                        onClick={() => toggleFavorite(product)}
                                                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
                                                    >
                                                        <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                                                <div>
                                                    <Link to={`/products/${product.id}`} className={isSelectMode ? "pointer-events-none" : ""}>
                                                        <h3 className="font-semibold text-xl mb-2 text-gray-800 hover:text-red-600 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </Link>

                                                    <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>

                                                    <div className="flex justify-between items-center mb-4">
                                                        <div>
                                                            <span className="font-bold text-red-600 text-xl">{formatCurrency(product.price)}</span>
                                                            {product.old_price && (
                                                                <span className="text-gray-400 text-sm line-through ml-2">
                                  {formatCurrency(product.old_price)}
                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isSelectMode && (
                                                    <div className="flex justify-start gap-3">
                                                        <button
                                                            onClick={() => handleBuyNow(product)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                                                        >
                                                            Mua ngay
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                addToCart(product, 1)
                                                                toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
                                                            }}
                                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center"
                                                        >
                                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                                            Thêm vào giỏ
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`)
                                                                toast.success("Đã sao chép liên kết sản phẩm")
                                                            }}
                                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                                                            title="Chia sẻ sản phẩm"
                                                        >
                                                            <Share2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default FavoritesPage
