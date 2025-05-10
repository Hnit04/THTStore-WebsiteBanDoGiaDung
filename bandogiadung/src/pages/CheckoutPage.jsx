"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { formatCurrency } from "../lib/utils.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { createSepayTransaction, checkTransactionStatus } from "../lib/api.js";
import SepayQRCode from "../components/payment/SepayQRCode.jsx";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://thtstore-websitebandogiadung-backend.onrender.com/";
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

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
  const [manualCheckLoading, setManualCheckLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const itemIds = params.getAll("items");
    const selected = cart.filter((item) => itemIds.includes(item._id));
    setSelectedItems(selected);
  }, [cart, location.search]);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 1000;
  const total = subtotal + shipping;

  useEffect(() => {
    console.log("Socket connecting to:", SOCKET_URL);
    socket.on("connect", () => {
      console.log("Socket connected, socket ID:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    socket.on("reconnect", (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
    });
    socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    if (transaction) {
      const handleTransactionUpdate = (data) => {
        console.log("Received transactionUpdate:", JSON.stringify(data, null, 2));
        if (data.transactionId === transaction.transactionId) {
          setTransactionStatus(data.status);
          if (data.status === "SUCCESS") {
            handlePaymentSuccess(transaction.transactionId);
          } else if (data.status === "FAILED") {
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
            setTransaction(null);
          }
        } else {
          console.log(`Transaction ID mismatch: Expected ${transaction.transactionId}, received ${data.transactionId}`);
        }
      };
      socket.on("transactionUpdate", handleTransactionUpdate);

      const checkStatusInterval = setInterval(async () => {
        try {
          const statusResponse = await checkTransactionStatus(transaction.transactionId);
          console.log("Fallback check status response:", JSON.stringify(statusResponse, null, 2));
          if (statusResponse.status === "SUCCESS") {
            handlePaymentSuccess(transaction.transactionId);
            clearInterval(checkStatusInterval);
          } else if (statusResponse.status === "FAILED") {
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
            setTransaction(null);
            clearInterval(checkStatusInterval);
          }
        } catch (error) {
          console.error("Fallback check failed:", error);
        }
      }, 10000);

      return () => {
        socket.off("transactionUpdate", handleTransactionUpdate);
        clearInterval(checkStatusInterval);
      };
    }
  }, [transaction]);

  const handlePaymentSuccess = async (transactionId) => {
    toast.success("Thanh toán thành công!");
    try {
      // Tạo order mới
      const orderPayload = {
        transactionId: transactionId,
        user_id: user?._id || "unknown",
        email: user?.email || "unknown@example.com",
        user_fullName: user?.fullName || "Unknown User",
        user_phone: user?.phone || "Chưa có số điện thoại",
        name: user?.fullName || "Unknown Receiver",
        phone: user?.phone || "Chưa có số điện thoại",
        status: "processing",
        total_amount: total,
        shipping_address: user?.address || "Chưa có địa chỉ",
        shipping_city: user?.city || "Chưa có thành phố",
        shipping_postal_code: user?.postalCode || "700000",
        shipping_country: user?.country || "Vietnam",
        payment_method: "banking",
        payment_status: "completed",
        items: selectedItems.map((item) => ({
          product_id: item.product._id,
          product_name: item.product.name,
          quantity: item.quantity,
          product_price: item.product.price,
        })),
      };

      const response = await fetch("https://thtstore-websitebandogiadung-backend.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await response.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Không thể tạo đơn hàng");
      }

      // Xóa giỏ hàng
      await Promise.all(selectedItems.map((item) => removeFromCart(item._id)));

      // Chuyển hướng đến trang xác nhận đơn hàng
      navigate("/order-confirmation", {
        state: { transactionId, items: selectedItems, total, orderId: orderData.data.id },
      });
    } catch (error) {
      console.error("Lỗi xử lý sau thanh toán:", error);
      toast.error("Đã xảy ra lỗi sau khi thanh toán. Vui lòng kiểm tra đơn hàng.");
    }
  };

  const handleManualCheck = async () => {
    if (!transaction) return;
    setManualCheckLoading(true);
    try {
      const statusResponse = await checkTransactionStatus(transaction.transactionId);
      console.log("Manual check status response:", JSON.stringify(statusResponse, null, 2));
      if (statusResponse.status === "SUCCESS") {
        handlePaymentSuccess(transaction.transactionId);
      } else if (statusResponse.status === "FAILED") {
        toast.error("Thanh toán thất bại. Vui lòng thử lại.");
        setTransaction(null);
      } else {
        toast.info("Giao dịch vẫn đang chờ xử lý. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Manual check failed:", error);
      toast.error("Không thể kiểm tra trạng thái giao dịch. Vui lòng thử lại.");
    } finally {
      setManualCheckLoading(false);
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

      console.log("Payload gửi đến SEPay:", JSON.stringify(payload, null, 2));
      const response = await createSepayTransaction(payload);
      console.log("==== Phản hồi từ createSepayTransaction ====");
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
      let errorMessage = "Không thể tạo giao dịch. Vui lòng thử lại.";
      if (error.message.includes("Thiếu SEPay API Key")) {
        errorMessage = "Lỗi hệ thống: Thiếu API Key SEPay. Vui lòng liên hệ hỗ trợ.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Không thể kết nối đến SEPay. Vui lòng kiểm tra kết nối mạng.";
      } else if (error.message.includes("Lỗi xác thực")) {
        errorMessage = "Lỗi xác thực với SEPay. Vui lòng liên hệ hỗ trợ.";
      }
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
                    <>
                      <SepayQRCode
                          transactionId={transaction.transactionId}
                          qrCodeUrl={transaction.qrCodeUrl}
                          amount={total}
                          onSuccess={handlePaymentSuccess}
                          onError={cancelTransaction}
                      />
                      <button
                          onClick={handleManualCheck}
                          disabled={manualCheckLoading}
                          className={`mt-4 block w-full text-center py-2 rounded-md font-medium ${
                              manualCheckLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                      >
                        {manualCheckLoading ? "Đang kiểm tra..." : "Kiểm tra trạng thái giao dịch"}
                      </button>
                    </>
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