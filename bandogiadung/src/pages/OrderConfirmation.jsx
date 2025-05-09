// client/src/pages/OrderConfirmation.jsx
"use client";

import { useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";

function OrderConfirmation() {
    const location = useLocation();
    const { transactionId } = location.state || {};

    if (!transactionId) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-6">Xác Nhận Đơn Hàng</h1>
                <p className="text-gray-600 mb-8">Không tìm thấy thông tin giao dịch.</p>
                <Link
                    to="/cart"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
                >
                    Quay lại giỏ hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-6">Xác Nhận Đơn Hàng</h1>
            <p className="text-gray-600 mb-8">
                Cảm ơn bạn! Đơn hàng của bạn với mã giao dịch <strong>{transactionId}</strong> đã được xử lý thành công.
            </p>
            <p className="text-gray-600 mb-8">
                Vui lòng kiểm tra email để nhận thông tin chi tiết. Chúng tôi sẽ liên hệ với bạn sớm nhất.
            </p>
            <Link
                to="/"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
            >
                Tiếp tục mua sắm
            </Link>
        </div>
    );
}

export default OrderConfirmation;