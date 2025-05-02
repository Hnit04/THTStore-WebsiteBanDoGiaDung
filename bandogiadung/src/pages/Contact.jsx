import React from 'react';

function Contact() {
    return (
        <div className="container mx-auto py-10 px-6 max-w-l bg-gray-50 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-teal-700 text-center mb-8">
                Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-gray-600 mb-6 text-center">
                Chúng tôi luôn sẵn lòng hỗ trợ bạn. Vui lòng liên hệ với nhân viên phụ trách dưới đây:
            </p>

            <div className="employee-list grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="employee-card bg-white p-6 rounded-md border border-gray-200 hover:shadow-lg transition duration-300">
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">
                        Trần Ngọc Hưng
                    </h2>
                    <p className="text-gray-500 mb-1">Mã NV: 22711231</p>
                    <p className="text-gray-500 mb-1">Email: tranngochung19112004@gmail.com</p>
                    <p className="text-gray-500">Điện thoại: 0393465113</p>
                </div>

                <div className="employee-card bg-white p-6 rounded-md border border-gray-200 hover:shadow-lg transition duration-300">
                    <h2 className="text-xl font-semibold text-indigo-600 mb-2">
                        Trần Công Tính
                    </h2>
                    <p className="text-gray-500 mb-1">Mã NV: 22716181</p>
                    <p className="text-gray-500 mb-1">Email: tinh.trancon@example.com</p>
                    <p className="text-gray-500">Điện thoại: 091xxxxxxx</p>
                </div>

                <div className="employee-card bg-white p-6 rounded-md border border-gray-200 hover:shadow-lg transition duration-300">
                    <h2 className="text-xl font-semibold text-purple-600 mb-2">
                        Hồ Vĩnh Thái
                    </h2>
                    <p className="text-gray-500 mb-1">Mã NV: 22717181</p>
                    <p className="text-gray-500 mb-1">Email: thai.hovinh@example.com</p>
                    <p className="text-gray-500">Điện thoại: 092xxxxxxx</p>
                </div>
            </div>

            <div className="contact-form mt-12 p-8 border border-gray-200 rounded-md bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Gửi tin nhắn cho chúng tôi
                </h2>
                <form action="#" method="POST">
                    <div className="mb-6">
                        <label
                            htmlFor="name"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Tên của bạn:
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="email"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Email của bạn:
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <label
                            htmlFor="message"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Nội dung tin nhắn:
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows="5"
                            className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Gửi tin nhắn
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Contact;