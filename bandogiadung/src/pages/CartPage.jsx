// client/src/pages/CartPage.jsx
"use client";

import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, memo } from "react";
import { useCart } from "../contexts/CartContext.jsx";
import { formatCurrency } from "../lib/utils.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

// Component cho mỗi hàng trong bảng giỏ hàng
const CartItemRow = memo(({ item, selectedItems, handleItemSelect, updateQuantity, removeFromCart, inputQuantities, handleQuantityInputChange, handleQuantityInputBlur, handleQuantityInputKeyPress, loading }) => {
  const cartItemId = item._id;

  return (
      <tr key={cartItemId}>
        <td className="py-4 px-6">
          <input
              type="checkbox"
              checked={selectedItems.has(cartItemId)}
              onChange={() => handleItemSelect(cartItemId)}
              className="mr-2"
          />
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center">
            <img
                src={item.product.image_url || "/placeholder.svg?height=80&width=80"}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
            />
            <div className="ml-4">
              <Link
                  to={`/products/${item.product._id}`}
                  className="font-medium text-gray-900 hover:text-red-600"
              >
                {item.product.name}
              </Link>
              <p className="text-gray-600 text-sm">
                Tồn kho: {typeof item.product.stock !== 'undefined' ? item.product.stock : 'Không xác định'}
              </p>
            </div>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center relative">
            <button
                className="border border-gray-300 rounded-l-md px-3 py-1 disabled:bg-gray-200"
                onClick={() => updateQuantity(cartItemId, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1 || loading[cartItemId]}
            >
              -
            </button>
            <input
                type="number"
                value={inputQuantities[cartItemId] || item.quantity}
                onChange={(e) => handleQuantityInputChange(cartItemId, e.target.value)}
                onBlur={() => handleQuantityInputBlur(cartItemId, item)}
                onKeyPress={(e) => handleQuantityInputKeyPress(e, cartItemId, item)}
                className="w-16 text-center border-t border-b border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                min="1"
                max={item.product.stock}
                disabled={loading[cartItemId]}
            />
            <button
                className="border border-gray-300 rounded-r-md px-3 py-1 disabled:bg-gray-200"
                onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock || loading[cartItemId]}
            >
              +
            </button>
            {loading[cartItemId] && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                  <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
            )}
          </div>
        </td>
        <td className="py-4 px-6 text-right">{formatCurrency(item.product.price)}</td>
        <td className="py-4 px-6 text-right font-medium">
          {formatCurrency(item.product.price * item.quantity)}
        </td>
        <td className="py-4 px-6 text-right">
          <button
              onClick={() => removeFromCart(cartItemId)}
              className="text-red-600 hover:text-red-800 disabled:text-gray-400"
              disabled={loading[cartItemId]}
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
              <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
              />
            </svg>
          </button>
        </td>
      </tr>
  );
});

function CartPage() {
  const { cart, loading: cartLoading, updateQuantity: updateCartQuantity, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [inputQuantities, setInputQuantities] = useState({});
  const [itemLoading, setItemLoading] = useState({}); // Trạng thái tải cho từng item

  // Di chuyển useCallback lên cấp cao nhất
  const debouncedQuantityInputBlur = useCallback(
      debounce(async (itemId, item, value) => {
        const parsedQuantity = parseInt(value, 10);

        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
          toast.error("Số lượng phải lớn hơn 0");
          setInputQuantities(prev => ({
            ...prev,
            [itemId]: item.quantity.toString()
          }));
          return;
        }

        if (parsedQuantity > item.product.stock) {
          toast.error(`Sản phẩm ${item.product.name} chỉ còn ${item.product.stock} đơn vị trong kho`);
          setInputQuantities(prev => ({
            ...prev,
            [itemId]: item.quantity.toString()
          }));
          return;
        }

        try {
          setItemLoading(prev => ({ ...prev, [itemId]: true }));
          await updateCartQuantity(itemId, parsedQuantity);
          setInputQuantities(prev => ({
            ...prev,
            [itemId]: parsedQuantity.toString()
          }));
        } catch (error) {
          toast.error(error.message || "Không thể cập nhật số lượng");
          setInputQuantities(prev => ({
            ...prev,
            [itemId]: item.quantity.toString()
          }));
        } finally {
          setItemLoading(prev => ({ ...prev, [itemId]: false }));
        }
      }, 300),
      [updateCartQuantity]
  );

  useEffect(() => {
    console.log("Current cart items:", cart.map(item => ({
      cartItemId: item._id,
      productId: item.product._id,
      name: item.product.name
    })));
    console.log("Currently selected items:", Array.from(selectedItems));
    // Khởi tạo inputQuantities dựa trên cart
    const initialQuantities = cart.reduce((acc, item) => ({
      ...acc,
      [item._id]: item.quantity.toString()
    }), {});
    setInputQuantities(initialQuantities);
  }, [cart, selectedItems]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 500000 ? 0 : 30000;

  if (!isAuthenticated) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
          <Link
              to="/login?redirect=cart"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Đăng nhập ngay
          </Link>
        </div>
    );
  }

  if (cartLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
    );
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>
          <p className="text-gray-600 mb-8">Giỏ hàng của bạn đang trống.</p>
          <Link to="/products" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium">
            Tiếp tục mua sắm
          </Link>
        </div>
    );
  }

  const handleItemSelect = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    console.log("Updated selection:", Array.from(newSelectedItems));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const allItemIds = new Set(cart.map((item) => item._id));
      setSelectedItems(allItemIds);
      console.log("Selected all items:", Array.from(allItemIds));
    } else {
      setSelectedItems(new Set());
      console.log("Cleared selection");
    }
  };

  const handleQuantityInputChange = (itemId, value) => {
    setInputQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleQuantityInputKeyPress = (e, itemId, item) => {
    if (e.key === 'Enter') {
      debouncedQuantityInputBlur(itemId, item, inputQuantities[itemId]);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    const item = cart.find(i => i._id === itemId);
    if (!item) return;

    // Optimistic update
    setInputQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity.toString()
    }));
    setItemLoading(prev => ({ ...prev, [itemId]: true }));

    try {
      await updateCartQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật số lượng");
      setInputQuantities(prev => ({
        ...prev,
        [itemId]: item.quantity.toString()
      }));
    } finally {
      setItemLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const selectedCartItems = cart.filter((item) => selectedItems.has(item._id));
  const selectedSubtotal = selectedCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const selectedShipping = selectedSubtotal > 500000 ? 0 : 30000;
  const selectedTotal = selectedSubtotal + selectedShipping;

  const getCheckoutLink = () => {
    const params = new URLSearchParams();
    const itemsToCheckout = cart.filter(item => selectedItems.has(item._id));
    itemsToCheckout.forEach(item => {
      params.append("items", item._id);
      console.log(`Adding cart item to checkout: ${item._id} (${item.product.name})`);
    });
    const link = `/checkout?${params.toString()}`;
    console.log("Final checkout link:", link);
    return link;
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <label className="flex items-center">
                      <input
                          type="checkbox"
                          checked={selectedItems.size > 0 && selectedItems.size === cart.length}
                          onChange={handleSelectAll}
                          className="mr-2"
                      />
                      Chọn
                    </label>
                  </th>
                  <th className="py-4 px-6 text-left">Sản phẩm</th>
                  <th className="py-4 px-6 text-center">Số lượng</th>
                  <th className="py-4 px-6 text-right">Giá</th>
                  <th className="py-4 px-6 text-right">Tổng</th>
                  <th className="py-4 px-6"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {cart.map((item) => (
                    <CartItemRow
                        key={item._id}
                        item={item}
                        selectedItems={selectedItems}
                        handleItemSelect={handleItemSelect}
                        updateQuantity={handleUpdateQuantity}
                        removeFromCart={removeFromCart}
                        inputQuantities={inputQuantities}
                        handleQuantityInputChange={handleQuantityInputChange}
                        handleQuantityInputBlur={debouncedQuantityInputBlur}
                        handleQuantityInputKeyPress={handleQuantityInputKeyPress}
                        loading={itemLoading}
                    />
                ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <Link to="/products" className="border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded-md font-medium">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{selectedShipping === 0 ? "Miễn phí" : formatCurrency(selectedShipping)}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatCurrency(selectedTotal)}</span>
                  </div>
                </div>
                <Link
                    to={selectedItems.size > 0 ? getCheckoutLink() : "#"}
                    className={`block w-full text-center py-3 rounded-md font-medium ${
                        selectedItems.size > 0
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (selectedItems.size === 0) {
                        e.preventDefault();
                        toast.error("Vui lòng chọn ít nhất một sản phẩm");
                      }
                    }}
                >
                  Tiến hành thanh toán
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default CartPage;