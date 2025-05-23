// client/src/pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../lib/api.js";
import { formatCurrency } from "../lib/utils.js";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import UpdateProductModal from "../components/ui/UpdateProductModal.jsx";
import toast from "react-hot-toast";

function ProductDetailPage() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cart, refreshCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user && user.role === "admin";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");

  useEffect(() => {
    console.log("ProductDetailPage mounted with URL:", window.location.pathname);
    console.log("Extracted _id from useParams:", _id);

    async function loadProduct() {
      try {
        setLoading(true);
        console.log("Loading product with _id:", _id);
        const data = await getProductById(_id);
        if (!data) {
          throw new Error("Sản phẩm không tồn tại");
        }
        console.log("Loaded product:", data);
        setProduct(data);
      } catch (err) {
        console.error("Error loading product:", err);
        setError(err.message || "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    if (_id && typeof _id === "string" && /^[0-9a-fA-F]{24}$/.test(_id)) {
      loadProduct();
    } else {
      console.error("Invalid _id:", _id);
      setError("ID sản phẩm không hợp lệ");
      setLoading(false);
      navigate("/products", { replace: true });
    }
  }, [_id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (cartLoading) {
      toast.error("Đang xử lý giỏ hàng, vui lòng đợi...");
      return;
    }
    try {
      // Kiểm tra tồn kho
      if (typeof product.stock === 'undefined' || product.stock < quantity) {
        toast.error(`Sản phẩm ${product.name} chỉ còn ${product.stock || 0} đơn vị trong kho.`);
        return;
      }

      console.log("Adding to cart, product _id:", product._id, "Quantity:", quantity);
      await addToCart(product._id, quantity);
      await refreshCart();
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (cartLoading) {
      toast.error("Đang xử lý giỏ hàng, vui lòng đợi...");
      return;
    }
    try {
      // Kiểm tra tồn kho
      if (typeof product.stock === 'undefined' || product.stock < quantity) {
        toast.error(`Sản phẩm ${product.name} chỉ còn ${product.stock || 0} đơn vị trong kho.`);
        return;
      }

      console.log("Processing buy now for product _id:", product._id, "Quantity:", quantity);
      let cartItem = cart.find((item) => item.product?._id === product._id);

      if (!cartItem) {
        console.log("Product not in cart, adding to cart with quantity:", quantity);
        await addToCart(product._id, quantity);
        console.log("Fetching updated cart");
        const updatedCart = await refreshCart();
        cartItem = updatedCart.find((item) => item.product?._id === product._id);
      } else {
        console.log("Product already in cart, checking quantity");
        const newQuantity = quantity - (cartItem.quantity || 0);
        if (newQuantity > 0 && (typeof product.stock === 'undefined' || product.stock < cartItem.quantity + newQuantity)) {
          toast.error(`Sản phẩm ${product.name} chỉ còn ${product.stock || 0} đơn vị trong kho.`);
          return;
        }
        if (newQuantity !== 0) {
          console.log("Updating quantity by:", newQuantity);
          await addToCart(product._id, newQuantity);
          const updatedCart = await refreshCart();
          cartItem = updatedCart.find((item) => item.product?._id === product._id);
        }
      }

      if (!cartItem) {
        throw new Error("Không thể tìm thấy sản phẩm trong giỏ hàng sau khi thêm");
      }

      const params = new URLSearchParams();
      params.append("items", cartItem._id);
      console.log("Navigating to checkout with cart item _id:", cartItem._id);
      navigate(`/checkout?${params.toString()}`);
    } catch (error) {
      console.error("Lỗi khi mua ngay:", error);
      toast.error("Đã xảy ra lỗi khi mua ngay. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 bg-gray-200 rounded-lg h-64"></div>
              <div className="w-full md:w-1/2 space-y-3">
                <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (error || !product) {
    console.error("Product load error:", error, "Product ID:", _id);
    return (
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-3">Lỗi</h1>
          <p className="text-gray-600 mb-4">{error || "Không tìm thấy sản phẩm"}</p>
          <Link to="/products" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])].filter((url) => url);
  const currentImage = allImages[currentImageIndex]
      ? `/${allImages[currentImageIndex]}`
      : "/placeholder.svg?height=400&width=400";

  const handlePrevImage = () => {
    setSlideDirection("slide-right");
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setSlideDirection("slide-left");
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
      <div className="container mx-auto px-4 py-6">
        <Link to="/products" className="flex items-center text-gray-600 mb-4 hover:text-gray-900 text-sm">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách sản phẩm
        </Link>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 relative">
            <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 relative">
              <img
                  src={currentImage}
                  alt={product.name}
                  className={`w-full h-64 object-contain p-4 transition-all duration-500 ease-in-out ${
                      slideDirection === "slide-left"
                          ? "animate-slide-left"
                          : slideDirection === "slide-right"
                              ? "animate-slide-right"
                              : "opacity-100"
                  }`}
              />
            </div>
            {allImages.length > 1 && (
                <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-between w-full px-4">
                  <button
                      onClick={handlePrevImage}
                      className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                      onClick={handleNextImage}
                      className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${i < product.rating ? "fill-yellow-400" : "fill-gray-300"}`}
                        viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm">{product.review_count || 0} đánh giá</span>
            </div>
            <div>
              {formatCurrency(product.price) && (
                  <span className="font-bold text-red-600 text-lg">{formatCurrency(product.price)}</span>
              )}
              {formatCurrency(product.old_price) && (
                  <span className="text-gray-400 text-sm line-through ml-2">{formatCurrency(product.old_price)}</span>
              )}
            </div>
            <p className="text-gray-700 mb-2 text-sm">{product.description}</p>
            <p className="text-gray-600 mb-4 text-sm">
              Tồn kho: {typeof product.stock !== 'undefined' ? product.stock : 'Không xác định'}
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 text-sm">Số lượng:</label>
              <div className="flex items-center">
                <button
                    className="border border-gray-300 rounded-l-md px-2 py-1 text-sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                >
                  -
                </button>
                <span className="border-t border-b border-gray-300 px-3 py-1 text-sm">{quantity}</span>
                <button
                    className="border border-gray-300 rounded-r-md px-2 py-1 text-sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock === 0 || quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            {isAdmin ? (
                <div>
                  <button
                      className="w-full mb-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium text-sm"
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
            ) : (
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <button
                      className={`w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm ${
                          product.stock === 0 || cartLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleBuyNow}
                      disabled={product.stock === 0 || cartLoading}
                  >
                    Mua ngay
                  </button>
                  <button
                      className={`w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium text-sm ${
                          product.stock === 0 || cartLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || cartLoading}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
            )}
            <div className="space-y-3 border-t pt-4 text-sm">
              <div className="flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-gray-600"
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
                <span>Giao hàng miễn phí cho đơn hàng từ 500.000đ</span>
              </div>
              <div className="flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-gray-600"
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
  );
}

export default ProductDetailPage;