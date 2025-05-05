import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { PackageIcon, ShoppingBagIcon } from 'lucide-react';
import { getAllOrders } from '../lib/api';

const StatisticsPage = () => {
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-05-31' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching all orders with date range:', dateRange);
        const response = await getAllOrders({
          startDate: dateRange.start,
          endDate: dateRange.end,
        });
        console.log('API Response:', response);

        const orders = response.data || [];

        if (orders.length === 0) {
          console.warn('No orders found for the selected date range.');
          setError('Không tìm thấy đơn hàng nào trong khoảng thời gian đã chọn.');
          setMonthlyRevenue([]);
          setRecentTransactions([]);
          setTotalRevenue(0);
          return;
        }

        const revenueByMonth = {};
        let total = 0;
        orders.forEach(order => {
          const createdAt = new Date(order.created_at);
          if (isNaN(createdAt)) {
            console.warn('Invalid created_at for order:', order);
            return;
          }
          const monthYear = createdAt.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
          const amount = order.total_amount || 0;
          revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + amount;
          total += amount;
        });

        const monthlyData = Object.keys(revenueByMonth)
          .map(month => ({
            month,
            revenue: revenueByMonth[month],
          }))
          .sort((a, b) => new Date(a.month) - new Date(b.month));

        const sortedTransactions = orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(order => ({
            id: order.id || order._id,
            date: new Date(order.created_at).toLocaleDateString('vi-VN'),
            product: order.items && order.items[0]?.product_name || 'Sản phẩm không xác định',
            amount: order.total_amount || 0,
          }));

        setMonthlyRevenue(monthlyData);
        setRecentTransactions(sortedTransactions);
        setTotalRevenue(total);
      } catch (err) {
        const errorMessage = err.status === 401
          ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : err.status === 403
          ? 'Bạn không có quyền truy cập dữ liệu đơn hàng. Vui lòng liên hệ quản trị viên.'
          : `Không thể tải dữ liệu đơn hàng: ${err.message}`;
        setError(errorMessage);
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [dateRange]);

  useEffect(() => {
    if (monthlyRevenue.length === 0) return;

    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthlyRevenue.map(item => item.month),
          datasets: [{
            label: 'Doanh thu',
            data: monthlyRevenue.map(item => item.revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return (value / 1000000) + 'M';
                },
                color: '#4B5563',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
            x: {
              ticks: {
                color: '#4B5563',
              },
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 14,
                  family: 'Inter, sans-serif',
                },
                color: '#4B5563',
              },
            },
            tooltip: {
              backgroundColor: '#1F2937',
              titleFont: {
                family: 'Inter, sans-serif',
              },
              bodyFont: {
                family: 'Inter, sans-serif',
              },
              callbacks: {
                label: function(context) {
                  return `Doanh thu: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(context.raw)}`;
                },
              },
            },
          },
          maintainAspectRatio: false,
        },
      });

      return () => chart.destroy();
    }
  }, [monthlyRevenue]);

  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleDateChange = e => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Thống Kê Doanh Thu</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tổng quan doanh thu</h2>
                <PackageIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Từ {new Date(dateRange.start).toLocaleDateString('vi-VN')} đến{' '}
                    {new Date(dateRange.end).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="date"
                    name="start"
                    value={dateRange.start}
                    onChange={handleDateChange}
                    className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    name="end"
                    value={dateRange.end}
                    onChange={handleDateChange}
                    className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              {error && (
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
              )}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : monthlyRevenue.length > 0 ? (
                <div className="h-80">
                  <canvas id="revenueChart" className="w-full h-full"></canvas>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <PackageIcon className="w-12 h-12 text-gray-300 mb-2" />
                  <p>Không có dữ liệu doanh thu để hiển thị</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
              ) : recentTransactions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-300 mb-2" />
                  <p>Không có giao dịch nào trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;