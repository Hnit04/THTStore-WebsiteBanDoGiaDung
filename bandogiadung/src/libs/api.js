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

    return data
  } catch (error) {
    console.error("API Error:", error)
    throw error
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
  return response.data
}

export async function getProductById(id) {
  const response = await fetchAPI(`/products/${id}`)
  return response.data
}

// Danh mục
export async function getCategories() {
  const response = await fetchAPI("/categories")
  return response.data
}

// Đơn hàng
export async function createOrder(orderData) {
  const response = await fetchAPI("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  })
  return response.data
}

export async function getUserOrders() {
  const response = await fetchAPI("/orders")
  return response.data
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
    return response.data
  } catch (error) {
    // Nếu không lấy được thông tin user, xóa token
    localStorage.removeItem("token")
    return null
  }
}

// Giỏ hàng
export async function getCart() {
  const response = await fetchAPI("/cart")
  return response.data
}

export async function addToCart(productId, quantity) {
  const response = await fetchAPI("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  })
  return response.data
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetchAPI(`/cart/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  })
  return response.data
}

export async function removeFromCart(itemId) {
  const response = await fetchAPI(`/cart/${itemId}`, {
    method: "DELETE",
  })
  return response.data
}
