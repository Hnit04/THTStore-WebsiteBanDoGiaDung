import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateProduct } from "../../lib/api";
import { useCategories } from "../../hooks/useCategories";
function UpdateProductModal({ product, isOpen, onClose }) {
    const { categories, loading: categoriesLoading } = useCategories();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        price: "",
        old_price: "",
        description: "",
        image_url: "",
        category_id: "",
        discount: "",
        stock: ""
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
                category_id: product.category_id || "",
                discount: product.discount || 0,
                stock: product.stock || 0
            });
        }
    }, [product]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData((prev) => ({
                ...prev,
                image_url: `img/${file.name}` // cập nhật đường dẫn tương đối
            }));
        }
    };

    const uploadImage = async (file) => {
        console.log("Uploading image:", file);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { url: `img/${file.name}` }; // mô phỏng đường dẫn sau upload
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let imageUrl = formData.image_url;

            if (imageFile) {
                const uploadResult = await uploadImage(imageFile);
                if (uploadResult && uploadResult.url) {
                    imageUrl = uploadResult.url;
                } else {
                    throw new Error("Failed to upload image");
                }
            }

            const updatedData = {
                id: formData.id || product.id,
                name: formData.name,
                price: parseInt(formData.price?.toString() || "0", 10),
                old_price: parseInt(formData.old_price?.toString() || "0", 10),
                description: formData.description,
                image_url: imageUrl,
                category_id: formData.category_id,
                rating: 0,
                review_count: 0,
                is_new: false,
                discount: parseInt(formData.discount?.toString() || "0", 10),
                stock: parseInt(formData.stock?.toString() || "0", 10)
            };

            const response = await updateProduct(updatedData);

            if (response) {
                alert("Cập nhật sản phẩm thành công!");
                window.location.reload();
                onClose();
            } else {
                alert("Cập nhật sản phẩm thất bại!");
            }
        } catch (err) {
            onClose();
            window.location.reload();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-gray-50 p-6 rounded shadow-2xl w-full max-w-2xl border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Cập nhật sản phẩm</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Giá</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Giá cũ</label>
                            <input
                                type="number"
                                name="old_price"
                                value={formData.old_price}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                        <input
                            type="file"
                            name="image_url"
                            onChange={handleImageChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            accept="image/*"
                        />
                        {formData.image_url && (
                            <div className="mt-2">
                                <img
                                    src={"/" + formData.image_url}
                                    alt="Preview"
                                    className="h-20 w-20 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Giảm giá (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Số lượng tồn kho</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            disabled={loading}
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
            </div>
        </div>,
        document.body
    );
}

export default UpdateProductModal;
