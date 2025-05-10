"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkTransactionStatus } from "../../lib/api";
import { io } from "socket.io-client";

const SepayQRCode = ({ transactionId, qrCodeUrl, amount, onSuccess, onError }) => {
    const [status, setStatus] = useState("PENDING");
    const [timeLeft, setTimeLeft] = useState(import.meta.env.VITE_TRANSACTION_TIMEOUT || 300);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!transactionId) {
            console.warn("SepayQRCode: Không có transactionId được cung cấp");
            setError("Không thể kiểm tra trạng thái giao dịch: Thiếu mã giao dịch");
            return;
        }

        console.log("SepayQRCode: Khởi tạo với transactionId =", transactionId);

        // Sửa URL Socket.IO để loại bỏ "/api"
        const socket = io("https://thtstore-websitebandogiadung-backend.onrender.com", {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });
        let statusInterval;

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("transactionUpdate", (data) => {
            console.log("Transaction update received:", data);
            if (data.transactionId === transactionId) {
                setStatus(data.status);
                if (data.status === "SUCCESS") {
                    onSuccess && onSuccess(data);
                    clearInterval(statusInterval);
                } else if (data.status === "FAILED" || data.status === "EXPIRED") {
                    setError(data.error || "Giao dịch thất bại");
                    onError && onError(data);
                    clearInterval(statusInterval);
                }
            }
        });

        socket.on("connect_error", (err) => {
            console.warn("Socket connection failed, falling back to polling:", err.message);
            statusInterval = setInterval(async () => {
                try {
                    console.log("Kiểm tra trạng thái giao dịch:", transactionId);
                    const response = await checkTransactionStatus(transactionId);
                    console.log("Transaction status check:", response);
                    if (response.success && response.transaction) {
                        const newStatus = response.transaction.status;
                        if (newStatus !== status) {
                            setStatus(newStatus);
                            if (newStatus === "SUCCESS") {
                                onSuccess && onSuccess(response.transaction);
                                clearInterval(statusInterval);
                            } else if (newStatus === "FAILED" || newStatus === "EXPIRED") {
                                setError("Giao dịch thất bại hoặc đã hết hạn");
                                onError && onError(response.transaction);
                                clearInterval(statusInterval);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error checking transaction status:", error);
                    setError(`Lỗi kiểm tra trạng thái: ${error.message}`);
                }
            }, 5000); // Polling mỗi 5 giây
        });

        const timerInterval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerInterval);
                    setStatus("EXPIRED");
                    setError("Giao dịch đã hết hạn");
                    onError && onError({ status: "EXPIRED" });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            socket.disconnect();
            clearInterval(statusInterval);
            clearInterval(timerInterval);
        };
    }, [transactionId, onSuccess, onError, status]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleCancel = () => {
        navigate("/cart");
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">Quét mã QR để thanh toán</h2>

            {status === "SUCCESS" ? (
                <div className="bg-green-100 p-4 rounded-md mb-4">
                    <p className="text-green-700 font-medium">Thanh toán thành công!</p>
                    <p className="text-sm text-gray-600 mt-2">Đơn hàng của bạn đang được xử lý.</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 p-4 rounded-md mb-4">
                    <p className="text-red-700 font-medium">Thanh toán thất bại</p>
                    <p className="text-sm text-gray-600 mt-2">{error}</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <img
                            src={qrCodeUrl || "/placeholder-qr-code.svg"}
                            alt="QR Code thanh toán"
                            className="mx-auto w-64 h-64"
                            onError={() => {
                                console.error("QR code image failed to load:", qrCodeUrl);
                                setError("Không thể tải mã QR. Vui lòng thử lại.");
                            }}
                        />
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-700 mb-1">
                            Số tiền:{" "}
                            <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
              </span>
                        </p>
                        {transactionId && (
                            <p className="text-gray-700 mb-1">
                                Mã giao dịch: <span className="font-mono text-sm">{transactionId}</span>
                            </p>
                        )}
                        <p className="text-gray-700">
                            Thời gian còn lại: <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                        </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-md mb-4 text-sm text-gray-700">
                        <p>1. Mở ứng dụng ngân hàng hoặc ví điện tử</p>
                        <p>2. Quét mã QR</p>
                        <p>3. Xác nhận thanh toán</p>
                    </div>

                    <div className="mt-4 text-sm text-gray-700">
                        <p>Hoặc chuyển khoản trực tiếp:</p>
                        <p>Ngân hàng: MB Bank</p>
                        <p>Số tài khoản: 0326829327</p>
                        <p>Chủ tài khoản: TRAN CONG TINH</p>
                    </div>
                </>
            )}

            <div className="flex justify-between mt-4">
                <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    Quay lại giỏ hàng
                </button>

                {status === "SUCCESS" && (
                    <button
                        onClick={() => navigate("/order-confirmation")}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Xem đơn hàng
                    </button>
                )}
            </div>
        </div>
    );
};

export default SepayQRCode;