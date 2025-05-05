const API_URL = "http://localhost:5000/api";

// Hàm helper để gọi API
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem("token");
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  try {
    console.log('Gọi API:', url, 'với options:', options);
    const response = await fetch(url, options);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    console.log('Response từ API:', data);
    return data.data || data;
  } catch (error) {
    console.error(`API Error tại ${url}:`, error.message, 'Status:', error.status);
    throw error;
  }
}
// Sản phẩm
export async function getProducts(options = {}) {
  const queryParams = new URLSearchParams();

  if (options.category) queryParams.append("category", options.category);
  if (options.minPrice) queryParams.append("price[gte]", options.minPrice);
  if (options.maxPrice) queryParams.append("price[lte]", options.maxPrice);
  if (options.search) queryParams.append("name", options.search);
  if (options.limit) queryParams.append("limit", options.limit);
  if (options.page) queryParams.append("page", options.page);

  const queryString = queryParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

  const response = await fetchAPI(endpoint);
  return response;
}

export async function getProductById(id) {
  const response = await fetchAPI(`/products/${id}`);
  return response;
}

// Danh mục
export async function getCategories() {
  const response = await fetchAPI("/categories");
  return response;
}

// Đơn hàng
export async function createOrder(orderData) {
  const response = await fetchAPI("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  return response;
}

export async function getAllUsers() {
  const response = await fetchAPI("/users/customer");
  return response;
}

export async function getAllOrders() {
  const response = await fetchAPI("/users/orders");
  return response;
}

export async function getAllOrdersById(user) {
  console.log("user2", user);
  const response = await fetchAPI(`/users/myorders/${user.email}`);
  return response;
}

export async function getUserOrders() {
  const response = await fetchAPI("/orders");
  return response;
}

export async function cancelOrder(orderId) {
  const response = await fetchAPI(`/orders/${orderId}/cancel`, {
    method: "PUT",
  });
  return response;
}

// Xác thực
export async function login(email, password) {
  const response = await fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("token", response.token);
  return response;
}

export async function register(userData) {
  const response = await fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return response;
}

export async function verifyEmail(email, verificationCode) {
  const response = await fetchAPI("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, verificationCode }),
  });
  return response;
}

export async function forgotPassword(email) {
  const response = await fetchAPI("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return response;
}

export async function verifyResetCode(email, resetCode) {
  const response = await fetchAPI("/auth/verify-reset-code", {
    method: "POST",
    body: JSON.stringify({ email, resetCode }),
  });
  return response;
}

export async function resetPassword(email, resetCode, newPassword) {
  const response = await fetchAPI("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, resetCode, newPassword }),
  });
  return response;
}

export async function createProduct(productData) {
  const response = await fetchAPI("/users/product", {
    method: "POST",
    body: JSON.stringify(productData),
  });
  return response;
}

export async function updateProduct(productData) {
  const response = await fetchAPI(`/users/updateProduct/${productData.id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
  return response;
}

export async function logout() {
  await fetchAPI("/auth/logout", {
    method: "POST",
  });
  localStorage.removeItem("token");
}

export async function getCurrentUser() {
  try {
    const response = await fetchAPI("/auth/me");
    return response;
  } catch (error) {
    console.error("Failed to fetch current user:", error.message || error);
    localStorage.removeItem("token");
    return null;
  }
}

// Người dùng
export async function updateUserProfile(userData) {
  const response = await fetchAPI("/users/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
  return response;
}

export async function changePassword(passwordData) {
  const response = await fetchAPI("/users/change-password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
  return response;
}

// Giỏ hàng
export async function getCart() {
  const response = await fetchAPI("/cart");
  return response;
}

export async function addToCart(productId, quantity) {
  const response = await fetchAPI("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  return response;
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetchAPI(`/cart/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  return response;
}

export async function removeFromCart(itemId) {
  const response = await fetchAPI(`/cart/${itemId}`, {
    method: "DELETE",
  });
  return response;
}