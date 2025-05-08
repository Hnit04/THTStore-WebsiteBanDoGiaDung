import React, { useState } from "react";
import { Link, Outlet, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const adminMenuItems = [
  { to: "/admin", label: "Trang chủ" },
  { to: "/admin/products", label: "Sản phẩm" },
  { to: "/admin/customers", label: "Khách hàng" },
  { to: "/admin/orders", label: "Hóa đơn" },
  { to: "/admin/statistics", label: "Thống kê" },
];

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = isAuthenticated && user && user.role === "admin";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Nếu không phải admin, chuyển hướng về trang chủ
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

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
                className="block py-2 px-4 text-white hover:bg-gray-700 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Content Area */}
        <main className="p-6">
          <Outlet /> {/* Render các page admin hoặc trang tổng quan */}
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