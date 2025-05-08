// client/src/pages/CheckoutPage.jsx
"use client";

import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { formatCurrency } from "../lib/utils.js";
import { createOrder, getProductById } from "../lib/api.js";
import toast from "react-hot-toast";

function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedItemIds = searchParams.getAll("items");

  console.log("Selected Item IDs from URL:", selectedItemIds);
  console.log("Cart:", cart);

  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    district: user.district || "",
    ward: user.ward || "",
    paymentMethod: "cod",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCart = cart.filter((item) => selectedItemIds.includes(item._id || item.id));
  console.log("Selected Cart:", selectedCart);

  const subtotal = selectedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (!isAuthenticated) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập để tiến hành thanh toán.</p>
          <Link
              to="/login?redirect=checkout"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Đăng nhập ngay
          </Link>
        </div>
    );
  }

  if (!Array.isArray(cart) || cart.length === 0 || selectedCart.length === 0) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
          <p className="text-gray-600 mb-8">Không có sản phẩm nào được chọn để thanh toán. Vui lòng quay lại giỏ hàng.</p>
          <Link to="/cart" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium">
            Quay lại giỏ hàng
          </Link>
        </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.district ||
        !formData.ward
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    try {
      setIsSubmitting(true);

      // Kiểm tra tồn kho cho tất cả sản phẩm được chọn
      for (const item of selectedCart) {
        const product = await getProductById(item.product._id);
        if (!product || typeof product.stock === 'undefined' || product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${item.product.name} chỉ còn ${product.stock || 0} đơn vị trong kho.`);
        }
      }

      const orderData = {
        email: user.email,
        name: formData.fullName,
        phone: formData.phone,
        status: "pending",
        total_amount: total,
        shipping_address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`,
        shipping_city: formData.city,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === "cod" ? "pending" : "pending",
        items: selectedCart.map((item) => ({
          product_id: item.product._id || item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
        })),
      };
      console.log("Order Data:", orderData);

      await createOrder(orderData);

      for (const item of selectedCart) {
        await removeFromCart(item._id);
      }

      toast.success("Đặt hàng thành công!");
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error.message);
      toast.error(error.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                    />
                  </div>
                  <div className="hidden">
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                        disabled
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                    />
                  </div>
                  <div>
                    <label htmlFor="ward" className="block text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <input
                        type="text"
                        id="ward"
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                    />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                        type="radio"
                        id="banking"
                        name="paymentMethod"
                        value="banking"
                        checked={formData.paymentMethod === "banking"}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label htmlFor="banking">Chuyển khoản ngân hàng</label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium disabled:bg-gray-400"
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
              <p className="text-gray-600 text-sm mb-4">
                Muốn thay đổi số lượng? Vui lòng{" "}
                <Link to="/cart" className="text-red-600 hover:underline">
                  quay lại giỏ hàng
                </Link>.
              </p>
              <div className="divide-y">
                {selectedCart.map((item) => (
                    <div key={item._id || item.id} className="py-4 flex">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                            src={item.product.image_url || "/placeholder.svg?height=80&width=80"}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm">SL: {item.quantity}</p>
                        <p className="font-medium text-red-600">{formatCurrency(item.product.price * item.quantity)}</p>
                        <p className="text-gray-600 text-sm">
                          Tồn kho: {typeof item.product.stock !== 'undefined' ? item.product.stock : 'Không xác định'}
                        </p>
                        {item.product.stock <= 5 && item.product.stock > 0 && (
                            <p className="text-red-600 text-sm font-semibold">
                              Chỉ còn {item.product.stock} sản phẩm! Vui lòng đặt hàng nhanh.
                            </p>
                        )}
                      </div>
                    </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default CheckoutPage;