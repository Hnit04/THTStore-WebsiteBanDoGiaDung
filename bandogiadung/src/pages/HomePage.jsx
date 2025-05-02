import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts.js";
import { useCategories } from "../hooks/useCategories.js";
import { formatCurrency } from "../lib/utils.js";

function HomePage() {
  const { products = [], loading: productsLoading } = useProducts({ limit: 8 });
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl overflow-hidden my-8">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nâng tầm không gian sống của bạn</h1>
            <p className="text-lg mb-8">
              Khám phá bộ sưu tập đồ gia dụng cao cấp, hiện đại và tiện nghi. Biến ngôi nhà của bạn thành không gian
              sống hoàn hảo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-white text-red-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-center"
              >
                Mua sắm ngay
              </Link>
              <Link
                to="/products"
                className="border border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium text-center"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-full bg-white/10 transform skew-x-12 translate-x-1/2 hidden md:block"></div>
        <div className="absolute right-0 top-0 w-1/4 h-full bg-white/10 transform -skew-x-12 translate-x-1/3 hidden md:block"></div>
      </div>

      {/* Categories Section */}
      <div className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Danh Mục Sản Phẩm</h2>
          <p className="text-gray-600">Khám phá đa dạng các sản phẩm theo nhu cầu của bạn</p>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-gray-100 animate-pulse rounded-lg p-6 h-40"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                    category.color || "bg-blue-100 text-blue-600"
                  }`}
                >
                  <span className="text-2xl">{category.icon || "🏠"}</span>
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600">Những sản phẩm bán chạy và được yêu thích nhất</p>
          </div>
          <Link to="/products" className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md font-medium">
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsLoading
            ? [...Array(8)].map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="bg-white rounded-lg shadow overflow-hidden h-80 flex flex-col"
                >
                  <div className="h-48 bg-gray-100 animate-pulse"></div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="h-6 bg-gray-100 animate-pulse mb-2"></div>
                    <div className="flex justify-between items-center flex-grow">
                      <div className="h-5 w-1/3 bg-gray-100 animate-pulse"></div>
                      <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden group h-80 flex flex-col">
                  <Link to={`/products/${product.id}`}>
                    <div className="h-48 overflow-hidden">
                      <img
                        src={product.image_url || "/placeholder.svg?height=400&width=400"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-medium text-lg mb-2 hover:text-red-600 transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex justify-between items-center flex-grow">
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
      </div>

      {/* Testimonials Section */}
      <div className="py-12 bg-gray-50 rounded-xl my-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Khách Hàng Nói Gì</h2>
            <p className="text-gray-600">Những đánh giá từ khách hàng đã mua sắm tại HomeGoods</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                name: "Nguyễn Văn A",
                rating: 5,
                text: "Tôi rất hài lòng với chất lượng sản phẩm từ HomeGoods. Đồ dùng nhà bếp tôi mua đã giúp việc nấu nướng trở nên dễ dàng và thú vị hơn rất nhiều.",
              },
              {
                id: 2,
                name: "Trần Thị B",
                rating: 4,
                text: "Dịch vụ giao hàng nhanh chóng, sản phẩm đóng gói cẩn thận. Tôi đặc biệt thích bộ nồi inox mà tôi đã mua, chất lượng rất tốt so với giá tiền.",
              },
              {
                id: 3,
                name: "Lê Văn C",
                rating: 5,
                text: "Đây là lần thứ ba tôi mua hàng từ HomeGoods và tôi chưa bao giờ thất vọng. Sản phẩm luôn đúng như mô tả và dịch vụ khách hàng rất tốt.",
              },
            ].map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-4 h-4 ${i < testimonial.rating ? "fill-yellow-400" : "fill-gray-300"}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;