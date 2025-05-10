import React, { useEffect, useState, useRef } from 'react';
import { BarChart, LineChart, PieChart, ArrowUpRight, Package, DollarSign, Calendar, Users, ShoppingBag } from 'lucide-react';
import { getAllOrders } from '../lib/api.js';
import ApexCharts from 'apexcharts';
import * as XLSX from 'xlsx';

const StatisticsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const chartRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: '2025-12-30'
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    averageOrder: 0,
    topProduct: ''
  });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found, please log in.');
        }
        console.log('Token used:', token);
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        console.log('API response from /api/users/profile:', data);
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch user data');
        }
        setEmployeeName(data.data.fullName || 'Unknown User');
      } catch (error) {
        console.error('Error fetching employee data:', error.message);
        setEmployeeName('Unknown User');
      }
    };
    fetchEmployeeData();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllOrders();
        console.log('fetchOrders - Raw Response:', response);

        if (!response || typeof response !== 'object') {
          throw new Error('Response API không hợp lệ');
        }

        const ordersData = Array.isArray(response) ? response : (response.data || []);
        console.log('fetchOrders - Extracted orders:', ordersData);

        if (!Array.isArray(ordersData) || ordersData.length === 0) {
          throw new Error('Không có dữ liệu đơn hàng từ API');
        }

        setOrders(ordersData);
        processOrders(ordersData, dateRange.start, dateRange.end);
      } catch (error) {
        console.error('fetchOrders - Error:', {
          message: error.message,
          stack: error.stack,
          response: error.responseText ? error.responseText.slice(0, 100) : null
        });
        setError(error.message === 'Failed to fetch orders: 401 Unauthorized'
          ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : 'Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
        setOrders([]);
        setChartData([]);
        setRecentTransactions([]);
        setTotalRevenue(0);
        setSummaryStats({
          totalOrders: 0,
          totalCustomers: 0,
          averageOrder: 0,
          topProduct: ''
        });
        setTopProducts([]);
        setShowChart(false);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const processOrders = async (orders, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const filteredOrders = orders.filter(order => {
      const createdAt = new Date(order.created_at);
      return createdAt >= start && createdAt <= end && order.payment_status === "completed";
    });

    console.log('processOrders - Filtered orders (completed):', filteredOrders);

    if (filteredOrders.length === 0) {
      console.log('processOrders - No completed orders to process');
      setError(`Không có đơn hàng hoàn thành trong khoảng thời gian từ ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')}.`);
      setChartData([]);
      setRecentTransactions([]);
      setTotalRevenue(0);
      setSummaryStats({
        totalOrders: 0,
        totalCustomers: 0,
        averageOrder: 0,
        topProduct: ''
      });
      setTopProducts([]);
      setShowChart(false);
      return;
    }

    const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const groupBy = dayDiff <= 31 ? 'day' : dayDiff <= 365 ? 'month' : 'year';
    console.log('processOrders - Group by:', groupBy);

    const revenueByGroup = {};
    let total = 0;
    const productCounts = {};
    const customerEmails = new Set();

    for (const order of filteredOrders) {
      const createdAt = new Date(order.created_at);
      if (isNaN(createdAt)) {
        console.warn('processOrders - Invalid created_at for order:', order);
        continue;
      }
      let groupKey;
      if (groupBy === 'day') {
        groupKey = createdAt.toLocaleDateString('vi-VN');
      } else if (groupBy === 'month') {
        groupKey = createdAt.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
      } else {
        groupKey = createdAt.getFullYear().toString();
      }

      const amount = order.total_amount || 0;
      revenueByGroup[groupKey] = (revenueByGroup[groupKey] || 0) + amount;
      total += amount;

      if (order.items) {
        for (const item of order.items) {
          const productName = item.product_name || 'Sản phẩm không xác định';
          productCounts[productName] = (productCounts[productName] || 0) + (item.quantity || 1);
        }
      }

      if (order.email) {
        customerEmails.add(order.email);
      }
    }

    let chartData = [];
    if (groupBy === 'day') {
      const days = Array.from({ length: dayDiff }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.toLocaleDateString('vi-VN');
      });
      chartData = days.map(day => ({
        label: day,
        revenue: revenueByGroup[day] || 0,
      }));
    } else if (groupBy === 'month') {
      const months = [];
      let current = new Date(start);
      while (current <= end) {
        const monthYear = current.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
        months.push(monthYear);
        current.setMonth(current.getMonth() + 1);
      }
      chartData = months.map(month => ({
        label: month,
        revenue: revenueByGroup[month] || 0,
      }));
    } else {
      const years = [];
      for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        years.push(year.toString());
      }
      chartData = years.map(year => ({
        label: year,
        revenue: revenueByGroup[year] || 0,
      }));
    }

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

    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const totalOrders = filteredOrders.length;
    const totalCustomers = customerEmails.size;
    const averageOrder = totalOrders > 0 ? total / totalOrders : 0;

    console.log('processOrders - Processed:', { chartData, total, totalOrders, totalCustomers, topProduct, topProducts });
    setChartData(chartData);
    setRecentTransactions(sortedTransactions);
    setTotalRevenue(total);
    setSummaryStats({
      totalOrders,
      totalCustomers,
      averageOrder,
      topProduct
    });
    setTopProducts(topProducts);
    setShowChart(chartData.length > 0);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const percentChange = 12.4;

  const exportToExcel = () => {
    console.log('Export button clicked');
    if (loading || orders.length === 0) {
      console.log('Export aborted: loading=', loading, 'orders.length=', orders.length);
      setError('Dữ liệu đang tải hoặc không có đơn hàng để xuất. Vui lòng chờ hoặc kiểm tra lại.');
      return;
    }

    try {
      console.log('Starting export process with orders:', orders.length);
      const currentDate = new Date();
      const currentDateStr = currentDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      if (!chartData || chartData.length === 0) {
        setError('Không có dữ liệu doanh thu để xuất. Vui lòng kiểm tra khoảng thời gian hoặc dữ liệu đơn hàng.');
        return;
      }

      console.log('Chart data for export:', chartData);

      const exportData = chartData.map(item => ({
        'Ngày/Tháng/Năm': item.label,
        'Doanh Thu': formatCurrency(item.revenue),
      }));

      const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
      console.log('Total revenue for export:', totalRevenue);

      const wb = XLSX.utils.book_new();
      const wsData = [
        [`BÁO CÁO DOANH THU TỪ ${new Date(dateRange.start).toLocaleDateString('vi-VN')} ĐẾN ${new Date(dateRange.end).toLocaleDateString('vi-VN')}`],
        [''],
        ['Khoảng Thời Gian:', `${new Date(dateRange.start).toLocaleDateString('vi-VN')} - ${new Date(dateRange.end).toLocaleDateString('vi-VN')}`],
        ['Ngày Thực Hiện Thống Kê:', currentDateStr],
        [''],
        ['Ngày/Tháng/Năm', 'Doanh Thu'],
        ...exportData.map(item => Object.values(item)),
        [''],
        ['Tổng Doanh Thu:', formatCurrency(totalRevenue)],
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 0 } },
      ];

      ws['!cols'] = [
        { wch: 20 },
        { wch: 20 },
      ];

      const styleTitle = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
      const styleHeader = { font: { bold: true }, alignment: { horizontal: 'center' } };
      const styleSummary = { font: { bold: true }, alignment: { horizontal: 'right' } };

      ws['A1'].s = styleTitle;
      ws['A3'].s = { font: { bold: true } };
      ws['A4'].s = { font: { bold: true } };
      ws['A5'].s = { font: { bold: true } };
      ws['A6'].s = { font: { bold: true } };
      ['A8', 'B8'].forEach(cell => (ws[cell].s = styleHeader));
      ws[`A${wsData.length}`].s = styleSummary;
      ws[`B${wsData.length}`].s = { font: { bold: true } };

      XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Doanh Thu');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BaoCaoDoanhThu_${new Date(dateRange.start).toISOString().slice(0, 10)}_${new Date(dateRange.end).toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Excel file created and download triggered');
    } catch (error) {
      console.error('Export failed:', error);
      setError(`Không thể xuất báo cáo Excel: ${error.message}. Vui lòng thử lại.`);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      processOrders(orders, dateRange.start, dateRange.end);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!showChart || !chartRef.current || chartData.length === 0) {
      console.log('Chart not rendered:', { showChart, chartRef: !!chartRef.current, chartDataLength: chartData.length });
      return;
    }

    const dayDiff = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24));
    const groupBy = dayDiff <= 31 ? 'day' : dayDiff <= 365 ? 'month' : 'year';

    const options = {
      chart: {
        type: 'bar',
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
        dropShadow: {
          enabled: true,
          top: 2,
          left: 2,
          blur: 4,
          opacity: 0.2,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: chartData.length > 20 ? '50%' : chartData.length > 10 ? '40%' : '30%',
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
        categories: chartData.map(d => d.label),
        labels: {
          rotate: groupBy === 'day' ? -45 : 0,
          style: {
            colors: '#4B5563',
            fontSize: '12px',
            fontWeight: 400,
          },
          formatter: (value) => value,
        },
        title: {
          text: groupBy === 'day' ? 'Ngày' : groupBy === 'month' ? 'Tháng' : 'Năm',
          style: {
            color: '#4B5563',
            fontSize: '14px',
            fontWeight: 600,
          },
        },
        tickAmount: chartData.length > 20 ? Math.floor(chartData.length / 2) : undefined,
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          },
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
          shadeIntensity: 0.3,
          gradientToColors: ['#93C5FD'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
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
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          return `<div class="p-3 bg-white border shadow-lg rounded-lg">
            <div class="font-semibold text-gray-700">${w.globals.labels[dataPointIndex]}</div>
            <div class="text-gray-900">Doanh thu: ${formatCurrency(series[seriesIndex][dataPointIndex])}</div>
          </div>`;
        },
      },
      colors: ['#2563EB'],
      responsive: [{
        breakpoint: 640,
        options: {
          chart: {
            height: 300,
          },
          xaxis: {
            labels: {
              rotate: -45,
            },
          },
        },
      }],
    };

    const series = [{
      name: 'Doanh thu',
      data: chartData.map(d => d.revenue),
    }];

    console.log('Rendering chart with:', { series, categories: chartData.map(d => d.label) });

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
  }, [chartData, showChart, dateRange]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thống Kê Doanh Thu</h1>
        <div className="flex space-x-2 items-center">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Xuất báo cáo</span>
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
              {error && !showChart && (
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
              <h2 className="text-lg font-semibold">Sản phẩm bán chạy</h2>
            </div>
            <div className="p-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{product.name}</span>
                      <span className="text-sm font-bold">{product.count} lượt bán</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${(product.count / (topProducts[0].count || 1)) * 100}%` }}
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