"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { formatCurrency } from "../lib/utils.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { createSepayTransaction } from "../lib/api.js";
import SepayQRCode from "../components/payment/SepayQRCode.jsx";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://thtstore-websitebandogiadung-backend.onrender.com/";
const socket = io(SOCKET_URL);

function CheckoutPage() {
  const { cart, getCartTotal, removeFromCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("sepay-qr");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const itemIds = params.getAll("items");
    const selected = cart.filter((item) => itemIds.includes(item._id));
    setSelectedItems(selected);
  }, [cart, location.search]);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  useEffect(() => {
    if (transaction) {
      const handleTransactionUpdate = (data) => {
        if (data.transactionId === transaction.transactionId) {
          setTransactionStatus(data.status);
          if (data.status === "SUCCESS") {
            handlePaymentSuccess(data.transactionId);
          } else if (data.status === "FAILED") {
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
            setTransaction(null);
          }
        }
      };
      socket.on("transactionUpdate", handleTransactionUpdate);
      return () => socket.off("transactionUpdate", handleTransactionUpdate);
    }
  }, [transaction]);

  const handlePaymentSuccess = async (transactionId) => {
    toast.success("Thanh toán thành công!");
    try {
      await Promise.all(selectedItems.map((item) => removeFromCart(item._id)));
      navigate("/order-confirmation", {
        state: { transactionId, items: selectedItems, total },
      });
    } catch (error) {
      console.error("Lỗi xử lý sau thanh toán:", error);
      toast.error("Đã xảy ra lỗi sau khi thanh toán. Vui lòng kiểm tra đơn hàng.");
    }
  };

  const handlePayment = async () => {
    if (!selectedItems.length) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    setLoading(true);
    try {
      const orderId = `THT${Date.now()}`;
      const payload = {
        transaction_id: orderId,
        amount: total,
        description: `Thanh toán đơn hàng #${orderId}`,
        items: selectedItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        bank_account: {
          bank_code: "MB",
          account_number: "0326829327",
          account_name: "TRAN CONG TINH",
        },
        customerEmail: user?.email || "default@example.com",
      };

      const response = await createSepayTransaction(payload);
      console.log("==== RAW response from createSepayTransaction ====");
      console.log(JSON.stringify(response, null, 2));
      console.log("Type:", typeof response);

      if (!response.success) {
        throw new Error(response.error || "Không thể tạo giao dịch");
      }

      const qrUrl = response.qrCodeUrl || response.qr_code_url;
      if (!qrUrl) {
        throw new Error("Không nhận được mã QR từ SEPay");
      }

      setTransaction({
        transactionId: orderId,
        qrCodeUrl: qrUrl,
        status: "PENDING",
      });

      setTransactionStatus("PENDING");

      toast.success("Đã tạo giao dịch. Vui lòng quét mã QR để thanh toán.");
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.message || "Không thể tạo giao dịch. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelTransaction = () => {
    setTransaction(null);
    setTransactionStatus(null);
    toast.success("Đã hủy giao dịch.");
  };

  if (!isAuthenticated) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập để tiếp tục thanh toán.</p>
          <Link to="/login?redirect=checkout" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium">
            Đăng nhập ngay
          </Link>
        </div>
    );
  }

  if (!selectedItems.length) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
          <p className="text-gray-600 mb-8">Không có sản phẩm nào để thanh toán.</p>
          <Link to="/cart" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium">
            Quay lại giỏ hàng
          </Link>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Chi tiết đơn hàng</h2>
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">Sản phẩm</th>
                  <th className="py-4 px-6 text-right">Số lượng</th>
                  <th className="py-4 px-6 text-right">Giá</th>
                  <th className="py-4 px-6 text-right">Tổng</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {selectedItems.map((item) => (
                    <tr key={item._id}>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <img
                              src={item.product.image_url || "/placeholder.svg?height=80&width=80"}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded"
                          />
                          <div className="ml-4">
                            <p className="font-medium">{item.product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">{item.quantity}</td>
                      <td className="py-4 px-6 text-right">{formatCurrency(item.product.price)}</td>
                      <td className="py-4 px-6 text-right">{formatCurrency(item.product.price * item.quantity)}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Tóm tắt thanh toán</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatCurrency(total)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
                  <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      disabled={!!transaction}
                  >
                    <option value="sepay-qr">SEPay - QR Code (MB Bank)</option>
                  </select>
                </div>

                {transaction ? (
                    <SepayQRCode
                        transactionId={transaction.transactionId}
                        qrCodeUrl={transaction.qrCodeUrl}
                        amount={total}
                        onSuccess={handlePaymentSuccess}
                        onError={cancelTransaction}
                    />
                ) : (
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={`block w-full text-center py-3 rounded-md font-medium ${
                            loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                      {loading ? "Đang xử lý..." : "Thanh toán"}
                    </button>
                )}
              </div>
              <div className="mt-6 text-center">
                <Link to="/cart" className="text-red-600 hover:text-red-800">
                  Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default CheckoutPage;