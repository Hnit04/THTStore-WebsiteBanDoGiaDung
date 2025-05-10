import  { useState, useEffect } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, Package, Users, FileText, BarChart, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getCurrentUser } from '../../lib/api.js';

const adminMenuItems = [
  { to: '/admin'},
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/customers', label: 'Khách hàng', icon: Users },
  { to: '/admin/orders', label: 'Hóa đơn', icon: FileText },
  { to: '/admin/statistics', label: 'Thống kê', icon: BarChart },
];

const AdminDashboard = () => {
  const { user, isAuthenticated, logout, loading, authChecked, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verifyingAdmin, setVerifyingAdmin] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const verifyAdminStatus = async () => {
      console.log("AdminDashboard - Verifying admin status");
      try {
        setVerifyingAdmin(true);
        
        // Check for token
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("AdminDashboard - No token found during verification");
          setAdminVerified(false);
          return;
        }
        
        // Double-check user role directly from API
        const userData = await getCurrentUser();
        if (userData && userData.role === "admin") {
          console.log("AdminDashboard - Admin verified via API");
          setAdminVerified(true);
        } else {
          console.log("AdminDashboard - User not admin:", userData?.role);
          setAdminVerified(false);
        }
      } catch (error) {
        console.error("AdminDashboard - Admin verification failed:", error);
        setAdminVerified(false);
      } finally {
        setVerifyingAdmin(false);
      }
    };
    
    // Only verify if auth check is done and we think we're authenticated
    if (authChecked && isAuthenticated) {
      verifyAdminStatus();
    } else if (authChecked) {
      setVerifyingAdmin(false);
      setAdminVerified(false);
    }
    
  }, [authChecked, isAuthenticated]);
  console.log("AdminDashboard - Auth State:", {
    loading,
    authChecked,
    isAuthenticated,
    isAdmin,
    user: user?.email || "none"
  });

  if (loading) {
    return <LoadingScreen />;
  }

  if (authChecked && (!isAuthenticated || !isAdmin)) {
    console.log(`Redirect to login - isAuthenticated: ${isAuthenticated}, isAdmin: ${isAdmin}`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Extra verification to ensure user is admin
  
  
  // Debug output
  console.log("AdminDashboard - Auth State:", {
    loading,
    authChecked,
    verifyingAdmin,
    adminVerified, 
    isAuthenticated,
    isAdmin: user?.role === "admin",
    user: user?.email || "none"
  });
  
  // Manual refresh handler for debugging
  const handleManualRefresh = async () => {
    try {
      const userData = await getCurrentUser();
      console.log("Manual refresh - User data:", userData);
      window.location.reload();
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  // Show loading while checking auth or verifying admin
  if (loading || (authChecked && isAuthenticated && verifyingAdmin)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">Đang xác thực quyền truy cập...</p>
        <div className="text-sm text-gray-500 mt-2">
          {loading ? "Kiểm tra đăng nhập..." : "Xác thực quyền admin..."}
        </div>
      </div>
    );
  }
  
  // If auth is checked and user is not authenticated or not an admin, redirect to login
  if (authChecked && (!isAuthenticated || !adminVerified)) {
    console.log(`Redirect to login - isAuthenticated: ${isAuthenticated}, adminVerified: ${adminVerified}`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold">HomeGoods Admin</h1>
          {user && (
            <div className="mt-2 text-sm text-gray-300 flex items-center justify-between">
              <span>Xin chào, {user.fullName || user.email}</span>
              <button 
                onClick={handleManualRefresh}
                className="text-gray-400 hover:text-white"
                title="Làm mới phiên đăng nhập"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          )}
        </div>
        <nav className="mt-4">
          {adminMenuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block py-2 px-4 text-white hover:bg-gray-700 transition-colors flex items-center"
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon size={20} className="mr-2" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            to="/admin/profile"
            className="block py-2 px-4 text-white hover:bg-gray-700 transition-colors flex items-center"
            onClick={() => setIsSidebarOpen(false)}
          >
            <User size={20} className="mr-2" />
            Xem hồ sơ
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 px-4 text-white hover:bg-red-700 transition-colors flex items-center"
          >
            <LogOut size={20} className="mr-2" />
            Đăng xuất
          </button>
        </nav>
      </div>
      
      {/* Nút toggle sidebar trên mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay cho sidebar trên mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;