import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, verifyEmail as apiVerifyEmail, forgotPassword as apiForgotPassword, verifyResetCode as apiVerifyResetCode, resetPassword as apiResetPassword } from "../lib/api.js";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Helper function to check if token exists in localStorage
const hasToken = () => {
  const token = localStorage.getItem("token");
  console.log("Token check:", token ? "Token exists" : "No token");
  return !!token;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Enhanced function to fetch user data
  const fetchUserData = async () => {
    console.log("Fetching user data...");
    try {
      const userData = await getCurrentUser();
      console.log("User data received:", userData);
      if (userData && userData.role) {
        console.log("Valid user data, setting user state");
        setUser(userData);
        return true;
      } else {
        console.warn("Invalid user data received");
        return false;
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      return false;
    }
  };

  // Check authentication status on initial load and when token changes
  useEffect(() => {
    console.log("🔒 Auth check starting...");
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        if (hasToken()) {
          console.log("Token found, verifying user...");
          const success = await fetchUserData();
          
          if (!success) {
            console.warn("Auth check failed - clearing token");
            localStorage.removeItem("token");
            setUser(null);
          }
        } else {
          console.log("No token found during auth check");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error.message);
        setError(error.message || "Không thể kiểm tra trạng thái xác thực");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        console.log("Auth check complete, user:", user?.email || "none");
        setLoading(false);
        setAuthChecked(true);
      }
    };
  
    checkAuthStatus();
    
    // Add event listener for storage changes (in case token changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        console.log("Token changed in storage, rechecking auth...");
        checkAuthStatus();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    
    try {
      setLoading(true);
      setError(null);
      console.log(`Attempting login for ${email}...`);
      
      const data = await apiLogin(email, password);
      console.log("Login response:", data);
      
      if (data && data.user && data.token) {
        console.log("Setting user after login:", data.user);
        setUser(data.user);
        localStorage.setItem("token", data.token); 
        // Verify token was saved properly
        const savedToken = localStorage.getItem("token");
        console.log("Token saved:", savedToken ? "Yes" : "No");
        
        // Chuyển hướng dựa trên vai trò sau khi đăng nhập
        if (data.user.role === "admin") {
          console.log("Redirecting to admin dashboard");
          navigate("/admin", { replace: true });
        } else {
          console.log("Redirecting to home page");
          navigate("/", { replace: true });
        }
        toast.success("Đăng nhập thành công");
      } else {
        throw new Error("Dữ liệu đăng nhập không hợp lệ");
      }
      
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
      localStorage.removeItem("token");
      navigate("/", { replace: true }); 
      toast.success("Đăng xuất thành công");
    } catch (err) {
      console.error("Logout error:", err);
      // Still remove token and user even if logout API fails
      setUser(null);
      localStorage.removeItem("token");
      navigate("/", { replace: true });
      toast.error("Đăng xuất thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      authChecked,
      login,
      register,
      verifyEmail,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      logout,
      isAuthenticated: !!user,
      isAdmin,
    }),
    [user, loading, error, authChecked, isAdmin]
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