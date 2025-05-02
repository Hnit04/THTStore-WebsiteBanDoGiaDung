import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faLeaf, faTruck, faClock, faHeadset, faHistory, faBullseye } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
    return (
        <section id="about" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-4xl font-bold text-blue-700 mb-12">Về HomeCraft</h2>

                {/* Phần Giới Thiệu Chung */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-12">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Câu chuyện của chúng tôi</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        HomeCraft ra đời từ niềm đam mê với không gian sống đẹp và tiện nghi. Chúng tôi nhận thấy nhu cầu về
                        những sản phẩm gia dụng không chỉ đáp ứng công năng mà còn mang đậm dấu ấn cá nhân và góp phần tạo nên
                        một môi trường sống xanh, bền vững.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Bắt đầu từ một xưởng sản xuất nhỏ vào năm 2025, HomeCraft đã không ngừng nỗ lực để hoàn thiện quy trình,
                        nâng cao chất lượng sản phẩm và mở rộng danh mục. Đến nay, chúng tôi tự hào là một thương hiệu được nhiều
                        gia đình Việt tin dùng, mang đến hàng ngàn giải pháp cho ngôi nhà của bạn.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Chúng tôi luôn đặt khách hàng làm trung tâm, lắng nghe và thấu hiểu mọi nhu cầu để mang đến những sản phẩm
                        tốt nhất, cùng với dịch vụ tận tâm và chuyên nghiệp.
                    </p>
                </div>

                {/* Phần Sứ Mệnh và Tầm Nhìn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faHistory} className="text-blue-500 text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-blue-700 mb-2 text-center">Sứ mệnh</h3>
                            <p className="text-gray-700 leading-relaxed text-center">
                                Kiến tạo không gian sống lý tưởng cho mọi gia đình Việt thông qua các sản phẩm gia dụng chất lượng,
                                thiết kế tinh tế và dịch vụ tận tâm.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faBullseye} className="text-green-500 text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-green-700 mb-2 text-center">Tầm nhìn</h3>
                            <p className="text-gray-700 leading-relaxed text-center">
                                Trở thành thương hiệu gia dụng hàng đầu tại Việt Nam, tiên phong trong việc ứng dụng công nghệ mới
                                và phát triển bền vững.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Phần Cam Kết */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-12">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Cam kết của chúng tôi</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <li className="flex items-center">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-lg mr-3" />
                            <span className="text-gray-700 leading-relaxed">Sản phẩm chất lượng cao với bảo hành 12 tháng</span>
                        </li>
                        <li className="flex items-center">
                            <FontAwesomeIcon icon={faTruck} className="text-green-500 text-lg mr-3" />
                            <span className="text-gray-700 leading-relaxed">Giao hàng nhanh chóng trên toàn quốc</span>
                        </li>
                        <li className="flex items-center">
                            <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-lg mr-3" />
                            <span className="text-gray-700 leading-relaxed">Hỗ trợ đổi trả linh hoạt trong 30 ngày</span>
                        </li>
                        <li className="flex items-center">
                            <FontAwesomeIcon icon={faHeadset} className="text-purple-500 text-lg mr-3" />
                            <span className="text-gray-700 leading-relaxed">Tư vấn và hỗ trợ khách hàng 24/7</span>
                        </li>
                        <li className="flex items-center">
                            <FontAwesomeIcon icon={faLeaf} className="text-teal-500 text-lg mr-3" />
                            <span className="text-gray-700 leading-relaxed">Ưu tiên sản phẩm thân thiện với môi trường</span>
                        </li>
                        <li className="flex items-center">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-500 text-lg mr-3" />
                            <span className="text-gray-700 leading-relaxed">Giá cả cạnh tranh và nhiều ưu đãi hấp dẫn</span>
                        </li>
                    </ul>
                </div>

                {/* Phần Đội Ngũ (Chỉ Text) */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Đội ngũ của chúng tôi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div
                                className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                                <span className="text-gray-500 text-2xl font-semibold">TH</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Trần Ngọc Hưng</h4>
                            <p className="text-gray-600">MSSV: 22711231</p>
                        </div>
                        <div className="text-center">
                            <div
                                className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                                <span className="text-gray-500 text-2xl font-semibold">TT</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Trần Công Tính</h4>
                            <p className="text-gray-600">MSSV: 22716181</p>
                        </div>
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                                <span className="text-gray-500 text-2xl font-semibold">HT</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Hồ Vĩnh Thái</h4>
                            <p className="text-gray-600 text-sm">MSSV: 2277181</p>
                        </div>
                        {/* Bạn có thể thêm các thành viên khác của đội ngũ ở đây (chỉ với chữ cái đầu) */}
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-6 text-center">
                        Đội ngũ HomeCraft là những người trẻ đầy nhiệt huyết, giàu kinh nghiệm và luôn tận tâm với công
                        việc.
                        Chúng tôi cùng nhau xây dựng một môi trường làm việc sáng tạo và hợp tác để mang đến những giá
                        trị tốt nhất cho khách hàng.
                    </p>
                </div>

                {/* Phần Liên Hệ */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Liên hệ với chúng tôi</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Bạn có bất kỳ câu hỏi hoặc phản hồi nào? Đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.
                    </p>
                    <p className="text-blue-600 font-semibold">
                        Email: tranngochung19112004@gmail.com<br />
                        Điện thoại: 0393-465-113<br />
                        Địa chỉ: 12 Nguyễn Văn Bảo, quận Gò Vấp, Thành phố Hồ Chí Minh
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutPage;