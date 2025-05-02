import { Link } from "react-router-dom";
import { ChevronLeft, Shield, Eye, Database, Share2, Cookie, Lock, UserCheck, RefreshCw, Mail } from "lucide-react"

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient background */}
      <div className="bg-gray-400 h-80 text-black border border-gray-400 rounded-b-full">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 -mt-10">Chính Sách Bảo Mật</h1>
            <p className="text-xl text-black max-w-3xl mx-auto">
              Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn
            </p>
            <div className="mt-6 text-sm">Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}</div>
          </div>
        </div>
      </div>

      {/* Table of contents - visible on desktop */}
      <div className="w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-35">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Sidebar navigation */}
            <div className="hidden md:block md:w-64 bg-gray-50 p-6 border-r border-gray-200">
              <nav className="space-y-1 sticky top-6">
                <p className="font-medium text-gray-900 mb-4">Mục lục</p>
                {[
                  { id: "intro", name: "Giới thiệu" },
                  { id: "collection", name: "Thông tin thu thập" },
                  { id: "usage", name: "Cách sử dụng thông tin" },
                  { id: "sharing", name: "Chia sẻ thông tin" },
                  { id: "cookies", name: "Cookie" },
                  { id: "security", name: "Bảo mật dữ liệu" },
                  { id: "rights", name: "Quyền của bạn" },
                  { id: "changes", name: "Thay đổi chính sách" },
                  { id: "contact", name: "Liên hệ" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-100 hover:bg-gray-500 transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 md:p-10">
              <div className="prose max-w-none">
                <section
                  id="intro"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Shield className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">1. Giới thiệu</h2>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Chúng tôi coi trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân mà bạn chia sẻ với
                    chúng tôi. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá
                    nhân của bạn khi bạn sử dụng trang web và dịch vụ của chúng tôi.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Bằng cách sử dụng trang web và dịch vụ của chúng tôi, bạn đồng ý với các điều khoản của Chính sách
                    Bảo mật này.
                  </p>
                </section>

                <section
                  id="collection"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Eye className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">2. Thông tin chúng tôi thu thập</h2>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Chúng tôi có thể thu thập các loại thông tin sau:
                  </p>
                  <ul className="space-y-4">
                    <li className="bg-gray-50 p-4 rounded-lg border-l-4 text-gray-300">
                      <span className="font-medium text-gray-900 block mb-1">Thông tin cá nhân</span>
                      <span className="text-gray-600">
                        Tên, địa chỉ email, số điện thoại, địa chỉ và thông tin thanh toán khi bạn đăng ký tài khoản
                        hoặc thực hiện giao dịch.
                      </span>
                    </li>
                    <li className="bg-gray-50 p-4 rounded-lg border-l-4 text-gray-300">
                      <span className="font-medium text-gray-900 block mb-1">Thông tin sử dụng</span>
                      <span className="text-gray-600">
                        Dữ liệu về cách bạn tương tác với trang web của chúng tôi, bao gồm các trang bạn truy cập, thời
                        gian truy cập và các liên kết bạn nhấp vào.
                      </span>
                    </li>
                    <li className="bg-gray-50 p-4 rounded-lg border-l-4 text-gray-300">
                      <span className="font-medium text-gray-900 block mb-1">Thông tin thiết bị</span>
                      <span className="text-gray-600">
                        Dữ liệu về thiết bị bạn sử dụng để truy cập trang web của chúng tôi, bao gồm loại thiết bị, hệ
                        điều hành và trình duyệt web.
                      </span>
                    </li>
                  </ul>
                </section>

                <section
                  id="usage"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Database className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">3. Cách chúng tôi sử dụng thông tin</h2>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">Chúng tôi sử dụng thông tin thu thập được để:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Cung cấp, duy trì và cải thiện dịch vụ của chúng tôi",
                      "Xử lý giao dịch và gửi thông báo liên quan",
                      "Gửi thông tin cập nhật, thông báo kỹ thuật và hỗ trợ",
                      "Phản hồi các yêu cầu, câu hỏi và mối quan tâm của bạn",
                      "Phát hiện, ngăn chặn và giải quyết các hoạt động gian lận",
                      "Phân tích và cải thiện trải nghiệm người dùng",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                          <div className="h-2.5 w-2.5 rounded-full text-gray-500"></div>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  id="sharing"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Share2 className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">4. Chia sẻ thông tin</h2>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba. Tuy nhiên, chúng tôi có thể chia sẻ
                    thông tin trong các trường hợp sau:
                  </p>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-100">
                    <ul className="space-y-3">
                      {[
                        "Với các nhà cung cấp dịch vụ giúp chúng tôi vận hành trang web và dịch vụ",
                        "Khi có yêu cầu pháp lý hoặc để bảo vệ quyền, tài sản hoặc an toàn của chúng tôi hoặc người khác",
                        "Trong trường hợp sáp nhập, bán tài sản công ty hoặc tài trợ",
                        "Với sự đồng ý của bạn",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-gray-300 mr-2 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section
                  id="cookies"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Cookie className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">5. Cookie và công nghệ tương tự</h2>
                  </div>
                  <div className="bg-white p-5 rounded-lg border border-gray-200">
                    <p className="text-gray-600 leading-relaxed">
                      Chúng tôi sử dụng cookie và các công nghệ tương tự để thu thập thông tin và cải thiện trải nghiệm
                      của bạn. Bạn có thể kiểm soát việc sử dụng cookie thông qua cài đặt trình duyệt của mình.
                    </p>
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">
                        Cookie giúp chúng tôi cung cấp, bảo vệ và cải thiện dịch vụ của mình, chẳng hạn như bằng cách cá
                        nhân hóa nội dung, điều chỉnh và đo lường quảng cáo, cũng như cung cấp trải nghiệm an toàn hơn.
                      </p>
                    </div>
                  </div>
                </section>

                <section
                  id="security"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Lock className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">6. Bảo mật dữ liệu</h2>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin cá nhân của bạn khỏi truy cập
                      trái phép, thay đổi, tiết lộ hoặc phá hủy. Tuy nhiên, không có phương thức truyền qua internet
                      hoặc lưu trữ điện tử nào là an toàn 100%.
                    </p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { title: "Mã hóa dữ liệu", desc: "Bảo vệ thông tin nhạy cảm" },
                        { title: "Kiểm soát truy cập", desc: "Hạn chế quyền truy cập dữ liệu" },
                        { title: "Giám sát liên tục", desc: "Phát hiện hoạt động đáng ngờ" },
                        { title: "Cập nhật thường xuyên", desc: "Áp dụng các biện pháp bảo mật mới" },
                      ].map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                          <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section
                  id="rights"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <UserCheck className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">7. Quyền của bạn</h2>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Tùy thuộc vào luật pháp hiện hành, bạn có thể có quyền:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Truy cập", desc: "Xem thông tin cá nhân của bạn" },
                      { title: "Chỉnh sửa", desc: "Sửa thông tin không chính xác" },
                      { title: "Xóa", desc: "Yêu cầu xóa dữ liệu của bạn" },
                      { title: "Hạn chế", desc: "Giới hạn việc xử lý dữ liệu" },
                      { title: "Di chuyển", desc: "Nhận dữ liệu ở định dạng có thể chuyển giao" },
                      { title: "Phản đối", desc: "Phản đối việc xử lý dữ liệu của bạn" },
                    ].map((item, index) => (
                      <div key={index} className="flex p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-gray-800 font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  id="changes"
                  className="mb-12 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <RefreshCw className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">8. Thay đổi chính sách</h2>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-5">
                      <p className="text-gray-600 leading-relaxed">
                        Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn
                        về bất kỳ thay đổi quan trọng nào bằng cách đăng thông báo trên trang web của chúng tôi hoặc gửi
                        email cho bạn.
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 border-t border-purple-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-full p-1">
                          <svg
                            className="h-4 w-4 text-gray-900"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-900">
                          Việc tiếp tục sử dụng dịch vụ của chúng tôi sau khi thay đổi có hiệu lực đồng nghĩa với việc
                          bạn chấp nhận chính sách mới.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section
                  id="contact"
                  className="mb-8 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Mail className="h-8 w-8 text-black mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">9. Liên hệ với chúng tôi</h2>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Nếu bạn có bất kỳ câu hỏi hoặc quan ngại nào về Chính sách Bảo mật của chúng tôi, vui lòng liên hệ
                    với chúng tôi qua:
                  </p>
                  <div className="bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg overflow-hidden shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-purple-100">Email</p>
                          <p className="font-medium">privacy@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-purple-100">Điện thoại</p>
                          <p className="font-medium">(84) 123-456-789</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-purple-100">Địa chỉ</p>
                          <p className="font-medium">123 Đường ABC, Quận XYZ, Thành phố HCM, Việt Nam</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-700 bg-opacity-50">
                      <button className="w-full bg-white text-black font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
                        Gửi yêu cầu hỗ trợ
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
