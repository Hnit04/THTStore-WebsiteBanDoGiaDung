import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HomeGoods</h3>
            <p className="text-gray-400 mb-4">
              Chuyên cung cấp các sản phẩm đồ gia dụng chất lượng cao, giúp không gian sống của bạn trở nên tiện nghi và
              hiện đại.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Danh mục sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=kitchen" className="text-gray-400 hover:text-white">
                  Đồ dùng nhà bếp
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="text-gray-400 hover:text-white">
                  Thiết bị điện tử
                </Link>
              </li>
              <li>
                <Link to="/products?category=furniture" className="text-gray-400 hover:text-white">
                  Nội thất
                </Link>
              </li>
              <li>
                <Link to="/products?category=bathroom" className="text-gray-400 hover:text-white">
                  Đồ dùng phòng tắm
                </Link>
              </li>
              <li>
                <Link to="/products?category=decoration" className="text-gray-400 hover:text-white">
                  Đồ trang trí
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Thông tin</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gray-400 hover:text-white">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">
                  Hướng dẫn mua hàng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 text-gray-400 mt-0.5" />
                <span className="text-gray-400">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-gray-400">(028) 1234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-gray-400">info@homegoods.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} HomeGoods. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
