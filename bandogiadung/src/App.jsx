import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Thêm import
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import Contact from "./pages/Contact.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import PolicyPage from "./pages/PolicyPage.jsx";
import ProductAdminPage from "./pages/ProductAdminPage.jsx";
import CustomerPage from "./pages/CustomesPage.jsx";
import OrderPage from "./pages/OrderPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import MyOrderPage from "./pages/MyOrderPage.jsx";
import StatisticsPage from "./pages/StatisticsPage.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AdminOverview from "./components/admin/AdminOverview.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";

// Component bảo vệ route admin
const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user && user.role === "admin";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
      <>
        <Routes>
          {/* Routes thông thường với Header và Footer */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:_id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="orders" element={<MyOrderPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="privacy-policy" element={<PolicyPage />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="checkout" element={<CheckoutPage />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* Admin routes với AdminDashboard, không có Header/Footer */}
          <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
          >
            <Route index element={<ProductAdminPage />} />
            <Route path="products" element={<ProductAdminPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" reverseOrder={false} /> {/* Thêm Toaster */}
      </>
  );
}

export default App;