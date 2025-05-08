"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { updateProduct } from "../../lib/api";
import { useCategories } from "../../hooks/useCategories";
import { X, Upload, Save, ImageIcon, Tag, DollarSign, Package, FileText, Layers, Check } from "lucide-react";

function UpdateProductModal({ product, isOpen, onClose }) {
  const { categories, loading: categoriesLoading } = useCategories();
  const fileInputRef = useRef(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    old_price: "",
    description: "",
    image_url: "",
    images: [],
    category_id: "",
    discount: "",
    stock: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || "",
        name: product.name || "",
        price: product.price || 0,
        old_price: product.old_price || 0,
        description: product.description || "",
        image_url: product.image_url || "",
        images: product.images || [],
        category_id: product.category_id || "",
        discount: product.discount || 0,
        stock: product.stock || 0,
      });
      setImagePreviews([product.image_url, ...product.images].filter(url => url).map(url => `/${url}`));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImageUrls = files.map(file => `img/${file.name}`);
      setImageFiles(prev => [...prev, ...files]);
      setFormData(prev => ({
        ...prev,
        image_url: prev.image_url || newImageUrls[0] || "",
        images: [...prev.images, ...newImageUrls.slice(1)],
      }));

      const newPreviews = files.map(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise(resolve => {
          reader.onloadend = () => resolve(reader.result);
        });
      });
      Promise.all(newPreviews).then(previews => setImagePreviews(prev => [...prev, ...previews]));
    }
  };

  const uploadImage = async (file) => {
    console.log("Uploading image:", file);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { url: `img/${file.name}` };
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    setSuccessMessage("");

    try {
      if (!formData.name || !formData.price || !formData.category_id || !formData.stock) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        setLoading(false);
        return;
      }

      let imageUrl = formData.image_url;
      let images = formData.images;

      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(imageFiles.map(uploadImage));
        imageUrl = uploadResults[0]?.url || imageUrl;
        images = [...uploadResults.slice(1).map(result => result.url), ...images];
      }

      const updatedData = {
        id: formData.id || product.id,
        name: formData.name,
        price: Number.parseInt(formData.price?.toString() || "0", 10),
        old_price: Number.parseInt(formData.old_price?.toString() || "0", 10),
        description: formData.description,
        image_url: imageUrl,
        images: images,
        category_id: formData.category_id,
        rating: product.rating || 0,
        review_count: product.review_count || 0,
        is_new: product.is_new || false,
        discount: Number.parseInt(formData.discount?.toString() || "0", 10),
        stock: Number.parseInt(formData.stock?.toString() || "0", 10),
      };

      console.log("Updating product with data:", updatedData);

      const response = await updateProduct(updatedData);

      // Hiển thị thông báo thành công
      setSuccessMessage("Sản phẩm đã được cập nhật thành công!");

      // Đợi một chút để người dùng thấy thông báo thành công
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message || "Đã có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.price || !formData.category_id || !formData.stock)) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return createPortal(
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Cập nhật sản phẩm</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                >
                  1
                </div>
                <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                >
                  2
                </div>
                <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                >
                  3
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500">
                {currentStep === 1 ? "Thông tin cơ bản" : currentStep === 2 ? "Mô tả & Hình ảnh" : "Xác nhận"}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                        Tên sản phẩm <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                          type="text"
                          name="name"
                          id="name"
                          placeholder="Nhập tên sản phẩm"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category_id" className="flex items-center text-sm font-medium text-gray-700">
                        <Layers className="w-4 h-4 mr-2 text-indigo-600" />
                        Danh mục <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                          name="category_id"
                          id="category_id"
                          value={formData.category_id}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                    <div className="space-y-2">
                      <label htmlFor="price" className="flex items-center text-sm font-medium text-gray-700">
                        <DollarSign className="w-4 h-4 mr-2 text-indigo-600" />
                        Giá bán <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                            type="number"
                            name="price"
                            id="price"
                            placeholder="Nhập giá bán"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            required
                        />
                        <span className="absolute left-3 top-2 text-gray-500">₫</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="stock" className="flex items-center text-sm font-medium text-gray-700">
                        <Package className="w-4 h-4 mr-2 text-indigo-600" />
                        Số lượng tồn <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                          type="number"
                          name="stock"
                          id="stock"
                          placeholder="Nhập số lượng tồn kho"
                          value={formData.stock}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                      />
                    </div>
                  </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                      Mô tả sản phẩm
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        placeholder="Nhập mô tả chi tiết về sản phẩm"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <ImageIcon className="w-4 h-4 mr-2 text-indigo-600" />
                      Hình ảnh sản phẩm
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${imagePreviews.length > 0 ? "border-indigo-300" : "border-gray-300"}`}
                        onClick={triggerFileInput}
                    >
                      <input
                          type="file"
                          name="images"
                          id="images"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                          accept="image/*"
                          multiple
                      />

                      {imagePreviews.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 w-full">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                  <img
                                      src={preview || "/placeholder.svg"}
                                      alt={`Preview ${index + 1}`}
                                      className="max-h-32 mx-auto object-contain"
                                  />
                                  {index === 0 && (
                                      <span className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded">Ảnh chính</span>
                                  )}
                                </div>
                            ))}
                            <p className="text-sm text-center text-gray-500">Nhấp để thêm hoặc thay đổi hình ảnh</p>
                          </div>
                      ) : (
                          <div className="space-y-2 text-center">
                            <Upload className="w-12 h-12 mx-auto text-indigo-500" />
                            <p className="text-gray-700 font-medium">Kéo thả hoặc nhấp để tải lên</p>
                            <p className="text-sm text-gray-500">PNG, JPG, GIF (tối đa 5MB, nhiều ảnh)</p>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận thông tin sản phẩm</h3>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Tên sản phẩm</p>
                      <p className="font-medium">{formData.name || "Chưa có thông tin"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="font-medium">
                        {categories.find((c) => c.id === formData.category_id)?.name || "Chưa chọn danh mục"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Giá bán</p>
                      <p className="font-medium text-indigo-600">
                        {formData.price
                            ? `${Number.parseInt(formData.price.toString()).toLocaleString("vi-VN")}₫`
                            : "Chưa có thông tin"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Số lượng tồn</p>
                      <p className="font-medium">{formData.stock || "0"}</p>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <p className="text-sm text-gray-500">Mô tả</p>
                      <p className="font-medium">{formData.description || "Không có mô tả"}</p>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <p className="text-sm text-gray-500">Hình ảnh</p>
                      {imagePreviews.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {imagePreviews.map((preview, index) => (
                                <img
                                    key={index}
                                    src={preview || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="h-32 object-contain"
                                />
                            ))}
                          </div>
                      ) : (
                          <p className="text-gray-500">Không thay đổi hình ảnh</p>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Quay lại
                    </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </button>
                {currentStep < 3 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Tiếp theo
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        disabled={loading}
                    >
                      {loading ? (
                          <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                              <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                              ></circle>
                              <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Đang lưu...
                          </>
                      ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Lưu thay đổi
                          </>
                      )}
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
  );
}

export default UpdateProductModal;