import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function fetchAPI(endpoint, options = {}) {
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
    console.log(`Calling API: ${url}`, options);
    const response = await fetch(url, options);
    console.log(`API Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error Response:`, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response data:`, data);
    return data.data || data;
  } catch (error) {
    console.error(`API Error at ${url}:`, error.message);
    throw new Error(`Failed to fetch API at ${url}: ${error.message}`);
  }
}

// Sản phẩm
export async function getProducts(options = {}) {
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
  if (!id || typeof id !== "string") {
    console.error("getProductById called with invalid id:", id)
    throw new Error("ID sản phẩm không hợp lệ")
  }

  console.log("Fetching product with ID:", id)
  try {
    const response = await fetchAPI(`/products/${id}`)
    console.log("Product detail response:", response)
    return response
  } catch (error) {
    console.error("Error fetching product details:", error)
    throw error
  }
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

export async function getOrders({ startDate, endDate }) {
  const token = localStorage.getItem("token")
  console.log("api.js - Token:", token)
  console.log("api.js - API Request:", `${API_URL}/orders/admin?startDate=${startDate}&endDate=${endDate}`)

  try {
    const response = await axios.get(`${API_URL}/orders/admin`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log("api.js - API Response:", response.data)
    return response.data
  } catch (error) {
    console.error("api.js - API Error:", error.response?.data || error.message)
    throw error.response?.data || error
  }
}

export async function getAllUsers() {
  const response = await fetchAPI("/users/customer")
  return response
}

export async function getAllOrders() {
  const response = await fetchAPI("/users/orders")
  return response
}

export async function getAllOrdersById(user) {
  console.log("user2", user)
  const response = await fetchAPI(`/users/myorders/${user.email}`)
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

// Thanh toán SEPay - Phiên bản cải tiến
export async function createSepayTransaction(transactionData) {
  try {
    console.log("Tạo giao dịch SEPay:", transactionData);
    const response = await fetchAPI("/sepay/create-transaction", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
    console.log("Kết quả tạo giao dịch SEPay:", JSON.stringify(response, null, 2));

    if (!response.success) {
      throw new Error(response.error || "Không thể tạo giao dịch SEPay");
    }

    if (!response.qrCodeUrl && !response.qr_code_url) {
      throw new Error("Không nhận được qrCodeUrl từ SEPay");
    }

    return response;
  } catch (error) {
    console.error("Lỗi tạo giao dịch SEPay:", error);
    throw error;
  }
}

export async function checkTransactionStatus(transactionId) {
  try {
    if (!transactionId) {
      console.error("checkTransactionStatus: transactionId không được cung cấp");
      throw new Error("Mã giao dịch không hợp lệ");
    }

    console.log("Kiểm tra trạng thái giao dịch:", transactionId);
    const response = await fetchAPI(`/sepay/transaction/${transactionId}`);
    console.log("Kết quả kiểm tra trạng thái:", response);
    return response;
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái giao dịch:", error);
    throw error;
  }
}

export async function checkSepayConnection() {
  try {
    const response = await fetchAPI("/sepay/check-connection");
    return response;
  } catch (error) {
    console.error("Lỗi kiểm tra kết nối SEPay:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Xác thực
export async function login(email, password) {
  const response = await fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

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

export async function verifyEmail(email, verificationCode) {
  const response = await fetchAPI("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, verificationCode }),
  })
  return response
}

export async function forgotPassword(email) {
  const response = await fetchAPI("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
  return response
}

export async function verifyResetCode(email, resetCode) {
  const response = await fetchAPI("/auth/verify-reset-code", {
    method: "POST",
    body: JSON.stringify({ email, resetCode }),
  })
  return response
}

export async function resetPassword(email, resetCode, newPassword) {
  const response = await fetchAPI("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, resetCode, newPassword }),
  })
  return response
}

export async function createProduct(productData) {
  const response = await fetchAPI("/users/product", {
    method: "POST",
    body: JSON.stringify(productData),
  })
  return response
}

export async function updateProduct(productData) {
  const response = await fetchAPI(`/users/updateProduct/${productData.id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  })
  return response
}

export async function logout() {
  await fetchAPI("/auth/logout", {
    method: "POST",
  })
  localStorage.removeItem("token")
}

export async function getCurrentUser() {
  try {
    const response = await fetchAPI("/auth/me")
    return response
  } catch (error) {
    console.error("Failed to fetch current user:", error.message || error)
    localStorage.removeItem("token")
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
  try {
    console.log("Fetching cart data")
    const response = await fetchAPI("/cart")
    console.log("Cart data received:", response)
    return response
  } catch (error) {
    console.error("Error fetching cart:", error)
    return []
  }
}

export async function addToCart(productId, quantity) {
  if (!productId || typeof productId !== "string") {
    console.error("addToCart called with invalid productId:", productId)
    throw new Error("ID sản phẩm không hợp lệ")
  }

  console.log(`Adding to cart: productId=${productId}, quantity=${quantity}`)
  try {
    const response = await fetchAPI("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    })
    console.log("Add to cart response:", response)
    return response
  } catch (error) {
    console.error("Error adding to cart:", error)
    throw error
  }
}

export async function updateCartItem(itemId, quantity) {
  if (!itemId || typeof itemId !== "string") {
    console.error("updateCartItem called with invalid itemId:", itemId)
    throw new Error("ID item giỏ hàng không hợp lệ")
  }

  console.log(`Updating cart item: itemId=${itemId}, quantity=${quantity}`)
  try {
    const response = await fetchAPI(`/cart/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
    console.log("Update cart item response:", response)
    return response
  } catch (error) {
    console.error("Error updating cart item:", error)
    throw error
  }
}

export async function removeFromCart(itemId) {
  if (!itemId || typeof itemId !== "string") {
    console.error("removeFromCart called with invalid itemId:", itemId)
    throw new Error("ID item giỏ hàng không hợp lệ")
  }

  console.log(`Removing from cart: itemId=${itemId}`)
  try {
    const response = await fetchAPI(`/cart/${itemId}`, {
      method: "DELETE",
    })
    console.log("Remove from cart response:", response)
    return response
  } catch (error) {
    console.error("Error removing from cart:", error)
    throw error
  }
}

export async function clearCart() {
  try {
    console.log("Clearing cart")
    const response = await fetchAPI("/cart/clear", {
      method: "DELETE",
    })
    console.log("Clear cart response:", response)
    return response
  } catch (error) {
    console.error("Error clearing cart:", error)
    throw error
  }
}
