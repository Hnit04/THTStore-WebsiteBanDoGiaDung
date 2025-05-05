import { Outlet, useLocation } from "react-router-dom"; // Thêm useLocation để kiểm tra đường dẫn
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { Toaster } from "react-hot-toast";
import Chatbot from "../Chatbot"; // Import Chatbot (điều chỉnh đường dẫn nếu cần)

function Layout() {
    const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
    const isAdminPage = location.pathname.startsWith("/admin"); // Kiểm tra nếu là trang admin

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <Toaster position="top-right" />
            {!isAdminPage && <Chatbot />} {/* Chỉ hiển thị Chatbot nếu không phải trang admin */}
        </div>
    );
}

export default Layout;