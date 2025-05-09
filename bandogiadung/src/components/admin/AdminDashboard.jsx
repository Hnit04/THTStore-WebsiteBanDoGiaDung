import React, { useState } from "react";
import { Link, Outlet, Navigate } from "react-router-dom";
import { Menu, X, User, LogOut, Home, Package, Users, FileText, BarChart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const adminMenuItems = [
  { to: "/admin", label: "Bảng điều khiển", icon: Home },
  { to: "/admin/products", label: "Sản phẩm", icon: Package },
  { to: "/admin/customers", label: "Khách hàng", icon: Users },
  { to: "/admin/orders", label: "Hóa đơn", icon: FileText },
  { to: "/admin/statistics", label: "Thống kê", icon: BarChart },
];

const AdminDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = isAuthenticated && user && user.role === "admin";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Nếu không phải admin, chuyển hướng về trang chủ
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold">HomeGoods Admin</h1>
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
        {/* Content Area */}
        <main className="p-6">
          <Outlet /> {/* Render các page admin, bao gồm ProfilePage */}
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