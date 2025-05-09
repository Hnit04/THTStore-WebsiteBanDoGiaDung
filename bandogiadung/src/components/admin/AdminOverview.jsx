import React, { useState, useEffect } from "react";
import { DollarSign, Users, Package, TrendingUp } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { formatCurrency, formatDate } from "../../lib/utils.js";
import { getAdminOrders, getTotalProducts } from "../../lib/api.js";
import toast from "react-hot-toast";

// Đăng ký các thành phần cần thiết cho Chart.js, bao gồm Filler
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminOverview = () => {
  const [overviewData, setOverviewData] = useState({
    monthlyRevenue: 0,
    monthlyCustomers: 0,
    totalProducts: 0,
    topProducts: [],
  });
  const [chartDataRevenue, setChartDataRevenue] = useState({
    labels: [],
    datasets: [{ label: "Doanh thu (VNĐ)", data: [], borderColor: "rgb(239, 68, 68)", backgroundColor: "rgba(239, 68, 68, 0.2)", tension: 0.4, fill: true }],
  });
  const [chartDataCustomers, setChartDataCustomers] = useState({
    labels: [],
    datasets: [{ label: "Khách hàng", data: [], borderColor: "rgb(59, 130, 246)", backgroundColor: "rgba(59, 130, 246, 0.2)", tension: 0.4, fill: true }],
  });
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: (ctx) => ctx.chart.data.datasets[0].label },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => (value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}K` : value),
        },
      },
    },
  };

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);

        // Lấy ngày đầu và cuối tháng hiện tại
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startDate = startOfMonth.toISOString().split("T")[0];
        const endDate = endOfMonth.toISOString().split("T")[0];

        // Kiểm tra token
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        }

        // Fetch đơn hàng
        let ordersResponse;
        try {
          ordersResponse = await getAdminOrders(startDate, endDate);
        } catch (err) {
          console.error("Lỗi khi gọi API /api/orders/orderCustomer:", {
            message: err.message,
            status: err.status,
            responseText: err.responseText,
          });
          throw new Error("Không thể lấy dữ liệu đơn hàng: " + err.message);
        }

        // Kiểm tra response
        if (!ordersResponse.success) {
          throw new Error(ordersResponse.error || "Lỗi từ API đơn hàng");
        }
        const orders = ordersResponse.data;

        // Tính doanh thu tháng
        const monthlyRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Tính số khách hàng (email duy nhất)
        const uniqueCustomers = [...new Set(orders.map((order) => order.email))].length;

        // Tính doanh thu và khách hàng theo ngày
        const revenueByDay = {};
        const customersByDay = {};
        orders.forEach((order) => {
          const date = formatDate(order.created_at, "YYYY-MM-DD");
          revenueByDay[date] = (revenueByDay[date] || 0) + (order.total_amount || 0);
          customersByDay[date] = customersByDay[date] ? [...new Set([...customersByDay[date], order.email])] : [order.email];
        });

        // Chuẩn bị dữ liệu biểu đồ
        const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
          return formatDate(date, "YYYY-MM-DD");
        });
        const revenueData = daysInMonth.map((date) => revenueByDay[date] || 0);
        const customerData = daysInMonth.map((date) => (customersByDay[date] ? customersByDay[date].length : 0));
        const labels = daysInMonth.map((date) => formatDate(date, "DD/MM"));

        setChartDataRevenue({
          labels,
          datasets: [
            {
              label: "Doanh thu (VNĐ)",
              data: revenueData,
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
        setChartDataCustomers({
          labels,
          datasets: [
            {
              label: "Khách hàng",
              data: customerData,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        });

        // Tính sản phẩm bán chạy
        const productSales = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const key = item.product_id;
            if (!productSales[key]) {
              productSales[key] = {
                id: key,
                name: item.product_name,
                quantitySold: 0,
                revenue: 0,
              };
            }
            productSales[key].quantitySold += item.quantity;
            productSales[key].revenue += item.quantity * item.product_price;
          });
        });
        const topProducts = Object.values(productSales)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 5);

        // Fetch tổng sản phẩm
        let productsResponse;
        try {
          productsResponse = await getTotalProducts();
        } catch (err) {
          console.error("Lỗi khi gọi API /api/products:", {
            message: err.message,
            status: err.status,
            responseText: err.responseText,
          });
          throw new Error("Không thể lấy dữ liệu sản phẩm: " + err.message);
        }

        // Kiểm tra response
        if (!productsResponse.success) {
          throw new Error(productsResponse.error || "Lỗi từ API sản phẩm");
        }
        const totalProducts = productsResponse.pagination.total;

        // Cập nhật state
        setOverviewData({
          monthlyRevenue,
          monthlyCustomers: uniqueCustomers,
          totalProducts,
          topProducts,
        });
      } catch (error) {
        console.error("Error fetching overview data:", {
          message: error.message,
          stack: error.stack,
        });
        toast.error(error.message || "Không thể tải dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <DollarSign size={32} className="text-red-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Doanh thu tháng</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(overviewData.monthlyRevenue)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Users size={32} className="text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Khách hàng trong tháng</h3>
            <p className="text-2xl font-bold text-gray-900">{overviewData.monthlyCustomers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Package size={32} className="text-green-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng sản phẩm</h3>
            <p className="text-2xl font-bold text-gray-900">{overviewData.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <Line data={chartDataRevenue} options={chartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Line data={chartDataCustomers} options={chartOptions} />
        </div>
      </div>

      {/* Sản phẩm bán chạy */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <TrendingUp size={24} className="text-purple-600 mr-2" />
          Sản phẩm bán chạy
        </h3>
        {overviewData.topProducts.length === 0 ? (
          <p className="text-gray-600">Không có dữ liệu sản phẩm bán chạy</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-gray-600">Sản phẩm</th>
                  <th className="py-2 px-4 text-gray-600">Số lượng bán</th>
                  <th className="py-2 px-4 text-gray-600">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {overviewData.topProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{product.name}</td>
                    <td className="py-2 px-4">{product.quantitySold}</td>
                    <td className="py-2 px-4">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;