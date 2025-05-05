import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Chatbot = () => {
    const location = useLocation();

    useEffect(() => {
        // Chỉ hiển thị chatbot trên các trang cụ thể (ví dụ: trang chủ, sản phẩm)
        const allowedPaths = ['/', '/products', '/cart'];
        const isAllowed = allowedPaths.includes(location.pathname);

        if (isAllowed && window.tidioChatApi) {
            window.tidioChatApi.show();
        } else if (window.tidioChatApi) {
            window.tidioChatApi.hide();
        }
    }, [location]);

    return null;
};

export default Chatbot;