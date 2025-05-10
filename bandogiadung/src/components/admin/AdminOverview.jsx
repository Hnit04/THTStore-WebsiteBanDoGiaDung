import React, { useState, useEffect, useRef } from "react";
import { DollarSign, Users, Package, TrendingUp } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import { formatCurrency, formatDate } from "../../lib/utils.js";
import { getAllOrders, getTotalProducts, getTotalCustomers } from "../../lib/api.js";
import toast from "react-hot-toast";

const AdminOverview = () => {
  const [overviewData, setOverviewData] = useState({
    yearlyRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    topProducts: [],
  });
  const [orders, setOrders] = useState([]);
  const chartRefRevenue = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true,
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories: [],
      labels: {
        rotate: -45,
        style: {
          colors: '#4B5563',
          fontSize: '12px',
        },
      },
      title: {
        text: 'Tháng',
        style: {
          color: '#4B5563',
          fontSize: '14px',
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value),
        style: {
          colors: '#4B5563',
          fontSize: '12px',
        },
      },
      title: {
        text: 'Doanh thu (VNĐ)',
        style: {
          color: '#4B5563',
          fontSize: '14px',
          fontWeight: 600,
        },
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#EF4444'],
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => formatCurrency(value),
        title: {
          formatter: () => 'Doanh thu:',
        },
      },
    },
    colors: ['#EF4444'],
    responsive: [{
      breakpoint: 640,
      options: {
        chart: { height: 300 },
        xaxis: { labels: { rotate: -45 } },
      },
    }],
  };

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        
        // Fetch orders using the getAllOrders method like StatisticsPage does
        const ordersResponse = await getAllOrders();
        console.log('fetchOverviewData - Raw Response:', ordersResponse);

        if (!ordersResponse || typeof ordersResponse !== 'object') {
          throw new Error('Response API không hợp lệ');
        }

        const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse.data || []);
        console.log('fetchOverviewData - Extracted orders:', orders);

        if (!Array.isArray(orders) || orders.length === 0) {
          throw new Error('Không có dữ liệu đơn hàng từ API');
        }
        
        setOrders(orders);
        
        // Process orders for revenue data
        const revenueByMonth = {};
        orders.forEach((order) => {
          const createdAt = new Date(order.created_at);
          if (!isNaN(createdAt)) {
            const monthKey = createdAt.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
            revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (order.total_amount || 0);
          }
        });
  
        const months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now.getFullYear(), i, 1);
          return formatDate(date, "MMM YYYY");
        });
        const revenueData = months.map((month) => revenueByMonth[month] || 0);
        const yearlyRevenue = revenueData.reduce((sum, rev) => sum + rev, 0);
  
        if (chartRefRevenue.current) {
          chartRefRevenue.current.updateSeries([{ name: "Doanh thu (VNĐ)", data: revenueData }]);
          chartRefRevenue.current.updateOptions({ xaxis: { categories: months } });
        }
  
        // Get top products
        const productSales = {};
        orders.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              const key = item.product_id;
              if (key) {
                if (!productSales[key]) {
                  productSales[key] = {
                    id: key,
                    name: item.product_name || 'Sản phẩm không xác định',
                    quantitySold: 0,
                    revenue: 0,
                  };
                }
                productSales[key].quantitySold += item.quantity || 0;
                productSales[key].revenue += (item.quantity || 0) * (item.product_price || 0);
              }
            });
          }
        });
        
        const topProducts = Object.entries(productSales)
          .map(([key, value]) => value)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 3);
  
        // Fetch additional data
        const customersResponse = await getTotalCustomers();
        console.log('Phản hồi API Khách Hàng:', customersResponse);
        if (!customersResponse.success) {
          throw new Error(customersResponse.error || "Lỗi từ API khách hàng");
        }
        const totalCustomers = customersResponse.data.total || 0;
  
        const productsResponse = await getTotalProducts();
        console.log('Phản hồi API Sản Phẩm:', productsResponse);
        if (!productsResponse.success) {
          throw new Error(productsResponse.error || "Lỗi từ API sản phẩm");
        }
        const totalProducts = productsResponse.pagination.total;
  
        setOverviewData({
          yearlyRevenue,
          totalCustomers,
          totalProducts,
          topProducts,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tổng quan:", {
          message: error.message,
          stack: error.stack,
        });
        setError(error.message || "Không thể tải dữ liệu tổng quan");
        toast.error(error.message || "Không thể tải dữ liệu tổng quan");
        if (error.message.includes('chuyển hướng') || error.message.includes('đăng nhập')) {
          window.location.href = '/login';
        }
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

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
          {error.includes('đăng nhập') && (
            <button
              onClick={() => window.location.href = '/login'}
              className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
            >
              Đăng nhập lại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <DollarSign size={32} className="text-red-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Doanh thu </h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(overviewData.yearlyRevenue)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Users size={32} className="text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng khách hàng</h3>
            <p className="text-2xl font-bold text-gray-900">{overviewData.totalCustomers}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <ReactApexChart
            options={chartOptions}
            series={[{ name: "Doanh thu (VNĐ)", data: chartOptions.chart.type === 'line' ? [] : [] }]}
            type="line"
            height={350}
            ref={chartRefRevenue}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <TrendingUp size={24} className="text-purple-600 mr-2" />
          Sản phẩm bán chạy
        </h3>
        {overviewData.topProducts.length > 0 ? (
          overviewData.topProducts.map((product, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{product.name}</span>
                <span className="text-sm font-bold">{product.quantitySold} lượt bán</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-500' : 'bg-purple-500'}`}
                  style={{ width: `${(product.quantitySold / (overviewData.topProducts[0].quantitySold || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center h-32 text-gray-500">
            <Package className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Không có dữ liệu sản phẩm bán chạy</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;