"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import toast from "react-hot-toast";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetCode, setShowResetCode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { login, forgotPassword, verifyResetCode, resetPassword, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      // Chuyển hướng được xử lý trong AuthContext
    } catch (err) {
      toast.error(err.message || "Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    console.log("handleForgotPassword called", { email });

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forgotPassword(email);
      console.log("Forgot password email sent:", response);
      setShowForgotPassword(false);
      setShowResetCode(true);
      toast.success("Mã đặt lại đã được gửi đến email của bạn");
    } catch (err) {
      console.error("Forgot password failed:", err);
      toast.error(err.message || "Gửi yêu cầu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    console.log("handleVerifyResetCode called", { email, resetCode });

    if (!resetCode) {
      toast.error("Vui lòng nhập mã đặt lại");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyResetCode(email, resetCode);
      console.log("Reset code verified:", response);
      setShowResetCode(false);
      setShowNewPassword(true);
    } catch (err) {
      console.error("Reset code verification failed:", err);
      toast.error(err.message || "Mã đặt lại không hợp lệ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log("handleResetPassword called", { email, newPassword });

    if (!newPassword || !confirmNewPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu mới");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetPassword(email, resetCode, newPassword);
      console.log("Password reset successful:", response);
      toast.success("Đặt lại mật khẩu thành công");
      setShowNewPassword(false);
    } catch (err) {
      console.error("Password reset failed:", err);
      toast.error(err.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {showForgotPassword
              ? "Quên Mật Khẩu"
              : showResetCode
              ? "Nhập Mã Đặt Lại"
              : showNewPassword
              ? "Đặt Mật Khẩu Mới"
              : "Đăng nhập"}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {showForgotPassword
              ? "Nhập email để nhận mã đặt lại mật khẩu"
              : showResetCode
              ? "Nhập mã đặt lại đã được gửi đến email của bạn"
              : showNewPassword
              ? "Nhập mật khẩu mới cho tài khoản của bạn"
              : "Nhập thông tin đăng nhập của bạn để tiếp tục"}
          </p>

          {!showForgotPassword && !showResetCode && !showNewPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-gray-700">
                    Mật khẩu
                  </label>
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          ) : showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi mã đặt lại"}
              </button>
            </form>
          ) : showResetCode ? (
            <form onSubmit={handleVerifyResetCode} className="space-y-4">
              <div>
                <label htmlFor="resetCode" className="block text-gray-700 mb-2">
                  Mã đặt lại
                </label>
                <input
                  id="resetCode"
                  type="text"
                  placeholder="Nhập mã đặt lại"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xác nhận..." : "Xác nhận mã"}
              </button>
            </form>
          ) : showNewPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          ) : null}

        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            {showForgotPassword || showResetCode || showNewPassword ? (
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowResetCode(false);
                  setShowNewPassword(false);
                }}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Quay lại đăng nhập
              </button>
            ) : (
              <>
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-red-600 hover:text-red-800 font-medium">
                  Đăng ký ngay
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;