import { Outlet } from "react-router-dom"
import Header from "./Header.jsx"
import Footer from "./Footer.jsx"
import { Toaster } from "react-hot-toast"

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
}

export default Layout
