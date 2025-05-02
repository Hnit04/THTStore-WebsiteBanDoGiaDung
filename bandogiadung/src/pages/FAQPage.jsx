import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const FAQPage = () => {
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const faqData = [
        {
            id: 1,
            question: 'HomeCraft có những loại sản phẩm gia dụng nào?',
            answer: 'Chúng tôi cung cấp đa dạng các sản phẩm gia dụng cho nhà bếp, phòng tắm, phòng ngủ và phòng khách, bao gồm đồ dùng nấu nướng, thiết bị vệ sinh, nội thất và đồ trang trí.'
        },
        {
            id: 2,
            question: 'Chính sách bảo hành của HomeCraft như thế nào?',
            answer: 'Tất cả các sản phẩm của HomeCraft đều được bảo hành 12 tháng kể từ ngày mua hàng đối với các lỗi sản xuất.'
        },
        {
            id: 3,
            question: 'Thời gian giao hàng của HomeCraft là bao lâu?',
            answer: 'Thời gian giao hàng tùy thuộc vào địa chỉ nhận hàng của bạn. Thông thường, đơn hàng sẽ được giao trong vòng 2-5 ngày làm việc.'
        },
        {
            id: 4,
            question: 'HomeCraft có hỗ trợ đổi trả sản phẩm không?',
            answer: 'Có, chúng tôi hỗ trợ đổi trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng nếu sản phẩm còn mới, chưa qua sử dụng và có đầy đủ tem mác, hóa đơn.'
        },
        {
            id: 5,
            question: 'Tôi có thể liên hệ với HomeCraft bằng cách nào?',
            answer: 'Bạn có thể liên hệ với chúng tôi qua email tranngochung19112004@gmail.com hoặc gọi điện thoại đến số 0393-465-113. Chúng tôi luôn sẵn lòng hỗ trợ bạn.'
        },
        // Thêm các câu hỏi và câu trả lời khác tại đây
    ];

    const toggleQuestion = (id) => {
        setExpandedQuestion(expandedQuestion === id ? null : id);
    };

    return (
        <section id="faq" className="py-12 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">Các Câu Hỏi Thường Gặp</h2>
                <div className="space-y-4">
                    {faqData.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div
                                className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-200 hover:bg-gray-300"
                                onClick={() => toggleQuestion(item.id)}
                            >
                                <h3 className="text-lg font-semibold text-gray-700">{item.question}</h3>
                                <FontAwesomeIcon
                                    icon={expandedQuestion === item.id ? faMinus : faPlus}
                                    className="text-blue-500"
                                />
                            </div>
                            {expandedQuestion === item.id && (
                                <div className="px-6 py-4 text-gray-600 leading-relaxed">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQPage;