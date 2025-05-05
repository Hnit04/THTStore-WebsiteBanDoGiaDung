import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, verifyEmail as apiVerifyEmail, forgotPassword as apiForgotPassword, verifyResetCode as apiVerifyResetCode, resetPassword as apiResetPassword } from "../lib/api.js";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await getCurrentUser();
          setUser((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(userData)) {
              return userData;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiLogin(email, password);
      setUser((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(data.user)) {
          return data.user;
        }
        return prev;
      });
      return data;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại");
      toast.error(err.message || "Đăng nhập thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Attempting register for:", email);
      const userData = {
        email,
        password,
        fullName: metadata.full_name || "",
      };
      const data = await apiRegister(userData);
      console.log("Registration successful:", data);
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
      return data;
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Đăng ký thất bại");
      toast.error(err.message || "Đăng ký thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, verificationCode) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Verifying email: ${email} with code: ${verificationCode}`);
      const data = await apiVerifyEmail(email, verificationCode);
      console.log(`Verification successful for ${email}`, data);
      return data;
    } catch (err) {
      console.error(`Verification failed for ${email}:`, err);
      setError(err.message || "Xác nhận email thất bại");
      toast.error(err.message || "Xác nhận email thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Requesting password reset for:", email);
      const data = await apiForgotPassword(email);
      console.log("Password reset email sent:", data);
      return data;
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Gửi yêu cầu đặt lại mật khẩu thất bại");
      toast.error(err.message || "Gửi yêu cầu đặt lại mật khẩu thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (email, resetCode) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Verifying reset code for ${email}: ${resetCode}`);
      const data = await apiVerifyResetCode(email, resetCode);
      console.log(`Reset code verified for ${email}`, data);
      return data;
    } catch (err) {
      console.error(`Reset code verification failed for ${email}:`, err);
      setError(err.message || "Xác nhận mã đặt lại thất bại");
      toast.error(err.message || "Xác nhận mã đặt lại thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, resetCode, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Resetting password for ${email}`);
      const data = await apiResetPassword(email, resetCode, newPassword);
      console.log(`Password reset successful for ${email}`, data);
      return data;
    } catch (err) {
      console.error(`Password reset failed for ${email}:`, err);
      setError(err.message || "Đặt lại mật khẩu thất bại");
      toast.error(err.message || "Đặt lại mật khẩu thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log("Logging out");
      await apiLogout();
      setUser(null);
      toast.success("Đăng xuất thành công");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Đăng xuất thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
      () => ({
        user,
        loading,
        error,
        login,
        register,
        verifyEmail,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        logout,
        isAuthenticated: !!user,
      }),
      [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};