"use client"

import { useState, useEffect } from "react"
import { SearchIcon, UserIcon } from "lucide-react"
import { getAllUsers } from "../lib/api.js"

const CustomerPage = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await getAllUsers()
        // console.log("Customer", response)
        // The response appears to be the data array directly
        setCustomers(response)
        if (response && response.length > 0) {
          setSelectedCustomer(response[0])
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer)
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone?.includes(searchText),
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN")
  }

  const getRoleColor = (role) => {
    return role === "user" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  const getRoleText = (role) => {
    return role === "user" ? "Khách hàng" : role
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Details Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Thông tin khách hàng</h2>
                <UserIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedCustomer ? (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-md">
                        {selectedCustomer.fullName ? selectedCustomer.fullName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${
                          selectedCustomer.role === "user" ? "bg-blue-500" : "bg-green-500"
                        } border-2 border-white flex items-center justify-center`}
                      >
                        <UserIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{selectedCustomer.fullName}</h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedCustomer.role)}`}
                      >
                        {getRoleText(selectedCustomer.role)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {selectedCustomer.phone || "Chưa cập nhật"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
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
                          {selectedCustomer.address || "Chưa cập nhật"}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Thành phố</p>
                          <p className="font-medium text-sm truncate">{selectedCustomer.city || "—"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Quận/Huyện</p>
                          <p className="font-medium text-sm truncate">{selectedCustomer.district || "—"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Phường/Xã</p>
                          <p className="font-medium text-sm truncate">{selectedCustomer.ward || "—"}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(selectedCustomer.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <UserIcon className="w-12 h-12 text-gray-300 mb-2" />
                  <p>Chọn một khách hàng để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold mb-4">Danh sách khách hàng</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại"
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
                    ×
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Họ và tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số điện thoại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <tr
                          key={customer._id}
                          onClick={() => handleRowClick(customer)}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedCustomer?._id === customer._id ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(customer.role)}`}
                            >
                              {getRoleText(customer.role)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          Không tìm thấy khách hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Hiển thị {filteredCustomers.length} trong tổng số {customers.length} khách hàng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerPage
