import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { createProduct } from "../../lib/api"; // Import hàm createProduct

function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const { categories, loading: categoriesLoading } = useCategories();

  const initialProduct = {
    name: "",
    price: "",
    old_price: "",
    image_url: "",
    description: "",
    category_id: "",
    rating: 0,
    review_count: 0,
    is_new: false,
    discount: 0,
    stock: 0,
  };

  const [product, setProduct] = useState(initialProduct);
  const [error, setError] = useState(null); // State để lưu trữ lỗi
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setProduct(initialProduct);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file" && files.length > 0) {
      const fileName = files[0].name;
      setProduct((prev) => ({
        ...prev,
        image_url: `img/${fileName}`, // Lưu đường dẫn tương đối, cần xử lý upload ở backend
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => { // Thêm async để sử dụng await
    e.preventDefault();
    setError(null); // Reset lỗi trước khi submit
    setLoading(true);

    try {
      // Chuyển đổi các giá trị số nếu cần
      const productData = {
        ...product,
        price: product.price ? parseInt(product.price, 10) : 0,
        old_price: product.old_price ? parseInt(product.old_price, 10) : 0,
        rating: product.rating ? parseFloat(product.rating) : 0,
        review_count: product.review_count ? parseInt(product.review_count, 10) : 0,
        discount: product.discount ? parseInt(product.discount, 10) : 0,
        stock: product.stock ? parseInt(product.stock, 10) : 0,
        created_at: new Date().toISOString(),
      };

      // Gọi hàm createProduct từ api.js
      const response = await createProduct(productData);
        if(response){
          alert("Thêm sản phẩm thành công!!!")
             onAddProduct(response.data);
             window.location.reload(); // Gọi callback để thêm sản phẩm vào danh sách
             onClose();
        }else{
             onClose();
             window.alert("Thêm sản phẩm thành công!!!")
             window.location.reload();
        }
        


    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi thêm sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="bg-white p-6 rounded shadow-2xl w-full max-w-2xl border border-gray-500">
        <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Tên sản phẩm"
                value={product.name}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá bán</label>
              <input
                type="number"
                name="price"
                id="price"
                placeholder="Giá bán"
                value={product.price}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="old_price" className="block text-sm font-medium text-gray-700">Giá gốc</label>
              <input
                type="number"
                name="old_price"
                id="old_price"
                placeholder="Giá gốc"
                value={product.old_price}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Hình ảnh</label>
              <input
                type="file"
                name="image_url"
                id="image_url"
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
                required // Thêm required để đảm bảo người dùng chọn ảnh
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                id="description"
                placeholder="Mô tả"
                value={product.description}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                name="category_id"
                id="category_id"
                value={product.category_id}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
                required
              >
                <option value="">Chọn danh mục</option>
                {categoriesLoading ? (
                  <option disabled>Đang tải danh mục...</option>
                ) : categories.length === 0 ? (
                  <option disabled>Không có danh mục</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700">Chiết khấu</label>
              <input
                type="number"
                name="discount"
                id="discount"
                placeholder="Chiết khấu"
                value={product.discount}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Số lượng tồn</label>
              <input
                type="number"
                name="stock"
                id="stock"
                placeholder="Số lượng"
                value={product.stock}
                onChange={handleChange}
                className="mt-1 w-full border p-2 rounded"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>} {/* Hiển thị thông báo lỗi */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 border rounded"
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading} // Vô hiệu hóa nút khi đang tải
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
