import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, verifyEmail as apiVerifyEmail } from "../lib/api.js";
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
          // console.log("Checking auth status with token:", token);
          const userData = await getCurrentUser();
          // console.log("User data fetched:", userData);
          setUser((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(userData)) {
              // console.log("Updating user:", userData);
              return userData;
            }
            // console.log("No user update needed");
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
      // console.log("Attempting login for:", email);
      const data = await apiLogin(email, password);
      setUser((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(data.user)) {
          console.log("Setting user after login:", data.user);
          return data.user;
        }
        console.log("No user update needed after login");
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
      // Không tự động đăng nhập sau khi xác nhận
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