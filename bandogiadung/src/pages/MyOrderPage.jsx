import React, { useState, useEffect } from "react";
import { SearchIcon, PackageIcon, TruckIcon, ClipboardListIcon, ShoppingBagIcon } from "lucide-react";
import { getAllOrdersById } from "../lib/api.js"; // Import hàm getAllOrders
import { useAuth } from "../contexts/AuthContext.jsx"; // Import useAuth nếu cần thiết
const MyOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const { user } = useAuth();

  // Đã sửa để khớp với cấu trúc dữ liệu backend
  const filteredOrders = orders.filter(order => {
    const phone = order.user_phone || "";
    const orderDate = new Date(order.created_at).toLocaleDateString("vi-VN");
  
    const matchesPhone = phone.includes(searchText);
    const matchesDate = searchDate
      ? orderDate.includes(searchDate)
      : true;
  
    return matchesPhone && matchesDate;
  });
  
  



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "Chờ xử lý";
            case "processing":
                return "Đang xử lý";
            case "shipped":
                return "Đang giao hàng";
            case "delivered":
                return "Đã giao hàng";
            case "cancelled":
                return "Đã hủy";
            default:
                return status || "Không xác định";
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method?.toLowerCase()) {
          case "cod":
            return "Thanh toán khi nhận hàng";
          case "banking":
            return "Chuyển khoản ngân hàng";
          case "momo":
            return "Thanh toán qua Momo";
          case "zalopay":
            return "Thanh toán qua ZaloPay";
        }
      };
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <ClipboardListIcon className="w-4 h-4" />;
      case "processing":
        return <PackageIcon className="w-4 h-4" />;
      case "shipped":
        return <TruckIcon className="w-4 h-4" />;
      case "delivered":
        return <ShoppingBagIcon className="w-4 h-4" />;
      case "cancelled":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return <ClipboardListIcon className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrdersById(user);
        setOrders(response);
        setSelectedOrder(response[0]);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setSelectedOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);
  

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Details Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
                <PackageIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedOrder ? (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-64 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold border-4 border-white shadow-md">
                        {selectedOrder.name}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${getStatusColor(
                          selectedOrder.status,
                        )} border-2 border-white flex items-center justify-center`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Đơn hàng #{selectedOrder.id}</h3>
                    {/* <p className="text-sm text-gray-500">{selectedOrder.email}</p> */}
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                      >
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                        <p className="font-medium flex items-center text-lg text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatCurrency(selectedOrder.total_amount)}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                        <p className="font-medium flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
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
                          {selectedOrder.shipping_address + ", " + selectedOrder.shipping_city}
                        </p>
                      </div>

                      <div className="mt-2">
                        <h4 className="font-medium text-gray-700 mb-2">Sản phẩm trong đơn hàng</h4>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center p-2 border border-gray-100 rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img
                                src={"/" + item.image_url || "/placeholder.svg"}
                                alt={item.product_name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBagIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className="text-sm font-medium">{item.product_name || "Unknown Product"}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">Giá bán: {formatCurrency(item.product_price) || "N/A"}</p>
                              <p className="text-xs font-medium">SL: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <PackageIcon className="w-12 h-12 text-gray-300 mb-2" />
                  <p>Chọn một đơn hàng để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold mb-4">Danh sách đơn hàng</h2>
              {/* <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số điện thoại của khách hàng"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {searchText && (
                  <button
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchText("")}
                  >
                    
                  </button>
                )}
              </div> */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo ngày đặt hàng"
                  className="w-full mt-5 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-7.5 h-5 w-5 text-gray-400" />
                {searchDate && (
                  <button
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchDate("")}
                  >
                    
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-160">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên người nhận
                      </th>
                      <th className=" text-center py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số điện thoại người nhận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hình thức thanh toán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày nhận hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr
                          key={order._id}
                          onClick={() => handleRowClick(order)}
                          className={`cursor-pointer 
                            ${selectedOrder?.id === order.id ? "bg-blue-50" : ""}
                            ${order.status?.toLowerCase() === "pending" &&
                            (new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24) > 7
                              ? "bg-red-100 text-red-600"
                              : ""}
                            hover:bg-gray-50
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getPaymentMethodText(order.payment_method)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.created_at ? formatDate(order.created_at) : "N/A"} 
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.updated_at ? formatDate(order.updated_at) : "Chưa nhận hàng"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          Không tìm thấy đơn hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrderPage;
