const API_URL = "http://localhost:5000/api"

// Hàm helper để gọi API
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  // Thêm token vào header nếu đã đăng nhập
  const token = localStorage.getItem("token")
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  // Mặc định headers
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Đã xảy ra lỗi")
    }
    
    return data.data || data // Trả về dữ liệu từ API
    
  } catch (error) {
    const statusCode = error.response?.status || "unknown";
    const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred";
    console.error(`API Error [${statusCode}]:`, errorMessage);
    throw new Error(`Failed to fetch API at ${url} [${statusCode}]: ${errorMessage}`);
  }
}

// Sản phẩm
export async function getProducts(options = {}) {
  // Xây dựng query string từ options
  const queryParams = new URLSearchParams()

  if (options.category) queryParams.append("category", options.category)
  if (options.minPrice) queryParams.append("price[gte]", options.minPrice)
  if (options.maxPrice) queryParams.append("price[lte]", options.maxPrice)
  if (options.search) queryParams.append("name", options.search)
  if (options.limit) queryParams.append("limit", options.limit)
  if (options.page) queryParams.append("page", options.page)

  const queryString = queryParams.toString()
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`

  const response = await fetchAPI(endpoint)
  return response
}

export async function getProductById(id) {
  const response = await fetchAPI(`/products/${id}`)
  return response
}

// Danh mục
export async function getCategories() {
  const response = await fetchAPI("/categories")
  return response
}

// Đơn hàng
export async function createOrder(orderData) {
  const response = await fetchAPI("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  })
  return response
}

export async function getUserOrders() {
  const response = await fetchAPI("/orders")
  return response
}

export async function cancelOrder(orderId) {
  const response = await fetchAPI(`/orders/${orderId}/cancel`, {
    method: "PUT",
  })
  return response
}

// Xác thực
export async function login(email, password) {
  const response = await fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  // Lưu token vào localStorage
  localStorage.setItem("token", response.token)

  return response
}

export async function register(userData) {
  const response = await fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  })

  return response
}

export async function logout() {
  await fetchAPI("/auth/logout", {
    method: "POST",
  })

  // Xóa token khỏi localStorage
  localStorage.removeItem("token")
}

export async function getCurrentUser() {
  try {
    const response = await fetchAPI("/auth/me")
    return response
  } catch (error) {
    console.error("Failed to fetch current user:", error.message || error);
    // Nếu không lấy được thông tin user, xóa token
    localStorage.removeItem("token");
    return null
  }
}

// Người dùng
export async function updateUserProfile(userData) {
  const response = await fetchAPI("/users/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  })
  return response
}

export async function changePassword(passwordData) {
  const response = await fetchAPI("/users/change-password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  })
  return response
}

// Giỏ hàng
export async function getCart() {
  const response = await fetchAPI("/cart")
  return response
}

export async function addToCart(productId, quantity) {
  const response = await fetchAPI("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  })
  return response
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetchAPI(`/cart/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  })
  return response
}

export async function removeFromCart(itemId) {
  const response = await fetchAPI(`/cart/${itemId}`, {
    method: "DELETE",
  })
  return response
}
