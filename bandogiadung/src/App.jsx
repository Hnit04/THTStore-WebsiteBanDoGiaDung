import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout.jsx"
import HomePage from "./pages/HomePage.jsx"
import ProductsPage from "./pages/ProductsPage.jsx"
import ProductDetailPage from "./pages/ProductDetailPage.jsx"
import CartPage from "./pages/CartPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx"
import CheckoutPage from "./pages/CheckoutPage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx"
import AboutPage from "./pages/AboutPage.jsx"
import Contact from "./pages/Contact.jsx"
import FAQPage from "./pages/FAQPage.jsx"
import PolicyPage from "./pages/PolicyPage.jsx"
import ProductAdminPage from "./pages/ProductAdminPage.jsx"
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="privacy-policy" element={<PolicyPage />} />
        {/* Admin */}
        <Route path="admin/products" element={<ProductAdminPage/>} />

        {/* Public Routes */}
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
