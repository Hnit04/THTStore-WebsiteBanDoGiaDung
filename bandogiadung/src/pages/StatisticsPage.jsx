import React, { useEffect, useState, useRef } from 'react';
import { BarChart, LineChart, PieChart, ArrowUpRight, Package, DollarSign, Calendar, Users, ShoppingBag } from 'lucide-react';
// import * as d3 from 'd3';
import { getAllOrders } from '../lib/api.js';
import ApexCharts from 'apexcharts';

const StatisticsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2025-12-31'
  });

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    averageOrder: 0,
    topProduct: ''
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders();
        console.log('fetchOrders - Raw Response:', response);
        const ordersData = Array.isArray(response) ? response : (response.data || []);
        console.log('fetchOrders - Extracted orders:', ordersData);
        setOrders(ordersData);
        processOrders(ordersData, dateRange.start, dateRange.end);
      } catch (error) {
        console.error('fetchOrders - Error:', error);
        setError('Không thể tải dữ liệu từ server. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.');
        setOrders([]);
        setShowChart(false);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const processOrders = (orders, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const filteredOrders = orders.filter(order => {
      const createdAt = new Date(order.created_at);
      return createdAt >= start && createdAt <= end;
    });

    console.log('processOrders - Filtered orders:', filteredOrders);

    if (filteredOrders.length === 0) {
      console.log('processOrders - No orders to process');
      setError(`Không có đơn hàng trong khoảng thời gian từ ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')}.`);
      setMonthlyRevenue([]);
      setYearlyRevenue([]);
      setRecentTransactions([]);
      setTotalRevenue(0);
      setSummaryStats({
        totalOrders: 0,
        totalCustomers: 0,
        averageOrder: 0,
        topProduct: ''
      });
      setShowChart(false);
      return;
    }

    const revenueByMonth = {};
    const revenueByYear = {};
    let total = 0;
    const productCounts = {};
    const customerEmails = new Set();

    filteredOrders.forEach(order => {
      const createdAt = new Date(order.created_at);
      if (isNaN(createdAt)) {
        console.warn('processOrders - Invalid created_at for order:', order);
        return;
      }
      const monthYear = createdAt.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
      const year = createdAt.getFullYear().toString();
      const amount = order.total_amount || 0;

      revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + amount;
      revenueByYear[year] = (revenueByYear[year] || 0) + amount;
      total += amount;

      if (order.items) {
        order.items.forEach(item => {
          const productName = item.product_name || 'Sản phẩm không xác định';
          productCounts[productName] = (productCounts[productName] || 0) + (item.quantity || 1);
        });
      }

      if (order.email) {
        customerEmails.add(order.email);
      }
    });

    const monthlyData = Object.keys(revenueByMonth)
      .map(month => ({
        month,
        revenue: revenueByMonth[month],
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    const yearlyData = Object.keys(revenueByYear)
      .map(year => ({
        year,
        revenue: revenueByYear[year],
      }))
      .sort((a, b) => a.year - b.year);

    const sortedTransactions = filteredOrders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((order, index) => ({
        id: order.id || `order-${index}`,
        date: new Date(order.created_at).toLocaleDateString('vi-VN'),
        product: order.items && order.items[0]?.product_name || 'Sản phẩm không xác định',
        amount: order.total_amount || 0,
      }));

    const topProduct = Object.keys(productCounts).reduce((a, b) =>
      productCounts[a] > productCounts[b] ? a : b, ''
    ) || 'Không xác định';

    const totalOrders = filteredOrders.length;
    const totalCustomers = customerEmails.size;
    const averageOrder = totalOrders > 0 ? total / totalOrders : 0;

    console.log('processOrders - Processed:', { monthlyData, yearlyData, total, totalOrders, totalCustomers, topProduct });
    setMonthlyRevenue(monthlyData);
    setYearlyRevenue(yearlyData);
    setRecentTransactions(sortedTransactions);
    setTotalRevenue(total);
    setSummaryStats({
      totalOrders,
      totalCustomers,
      averageOrder,
      topProduct
    });
    setShowChart(monthlyData.length > 0 || yearlyData.length > 0);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    processOrders(orders, value, dateRange.end);
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const percentChange = 12.4;

  useEffect(() => {
    if (orders.length > 0) {
      processOrders(orders, dateRange.start, dateRange.end);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!showChart || !chartRef.current) return;

    const data = monthlyRevenue.length > 0 ? monthlyRevenue : yearlyRevenue;
    const options = {
      chart: {
        type: 'bar',
        height: 300,
        animations: {
          enabled: true,
          easing: 'easeout',
          speed: 800,
        },
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: false,
          columnWidth: '30%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: data.map(d => d.month || d.year),
        labels: {
          rotate: -45,
          style: {
            colors: '#4B5563',
            fontSize: '12px',
          },
        },
        title: {
          text: monthlyRevenue.length > 0 ? 'Tháng' : 'Năm',
          style: {
            color: '#4B5563',
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => (value / 1000000) + 'M',
          style: {
            colors: '#4B5563',
            fontSize: '12px',
          },
        },
        title: {
          text: 'Doanh thu (VNĐ)',
          style: {
            color: '#4B5563',
            fontSize: '12px',
          },
        },
      },
      grid: {
        show: true,
        borderColor: '#E5E7EB',
        strokeDashArray: 5,
        xaxis: {
          lines: { show: false },
        },
        yaxis: {
          lines: { show: true },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#60A5FA'],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.7,
          stops: [0, 100],
        },
      },
      tooltip: {
        y: {
          formatter: (value) => formatCurrency(value),
          title: {
            formatter: () => 'Doanh thu:',
          },
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          return `<div class="p-2 bg-gray-800 text-white rounded-lg shadow-lg">
            <div>${w.globals.labels[dataPointIndex]}</div>
            <div>Doanh thu: ${formatCurrency(series[seriesIndex][dataPointIndex])}</div>
          </div>`;
        },
      },
      colors: ['#3B82F6'],
    };

    const series = [{
      name: 'Doanh thu',
      data: data.map(d => d.revenue),
    }];

    if (chartRef.current) {
      const chart = new ApexCharts(chartRef.current, {
        ...options,
        series,
      });
      chart.render();

      return () => {
        chart.destroy();
      };
    }
  }, [monthlyRevenue, yearlyRevenue, showChart]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thống Kê Doanh Thu</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </div>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>Tải xuống PDF</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> {percentChange}%
                </span>
                <span className="text-gray-500 ml-2">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold text-gray-900">{summaryStats.totalOrders}</h3>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> 8.2%
                </span>
                <span className="text-gray-500 ml-2">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
              <h3 className="text-2xl font-bold text-gray-900">{summaryStats.totalCustomers}</h3>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> 5.3%
                </span>
                <span className="text-gray-500 ml-2">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Giá trị đơn trung bình</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.averageOrder)}</h3>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-red-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1 transform rotate-135" /> 2.1%
                </span>
                <span className="text-gray-500 ml-2">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Biểu đồ doanh thu</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600">
                    Tùy chọn
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : showChart ? (
                <div className="h-80 w-full overflow-x-auto">
                  <div ref={chartRef}></div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-lg font-medium">Không có dữ liệu doanh thu để hiển thị</p>
                  <p className="text-sm text-gray-400">Vui lòng kiểm tra khoảng thời gian hoặc dữ liệu đơn hàng.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Phân tích doanh thu</h2>
            </div>
            <div className="p-4">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Sản phẩm điện tử</span>
                  <span className="text-sm font-bold">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Phụ kiện</span>
                  <span className="text-sm font-bold">22%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Dịch vụ</span>
                  <span className="text-sm font-bold">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium text-gray-700 mb-3">Top sản phẩm bán chạy</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{summaryStats.topProduct || 'Không xác định'}</span>
                        <span className="text-sm text-gray-600">{formatCurrency(summaryStats.averageOrder)}</span>
                      </div>
                      <div className="text-xs text-gray-500">{summaryStats.totalOrders} đơn hàng</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
              ) : recentTransactions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction, index) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Hoàn thành
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-lg font-medium">Không có giao dịch nào trong khoảng thời gian này</p>
                  <p className="text-sm text-gray-400">Vui lòng kiểm tra lại dữ liệu hoặc chọn khoảng thời gian khác.</p>
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