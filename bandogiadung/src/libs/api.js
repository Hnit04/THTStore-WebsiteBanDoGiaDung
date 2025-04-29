import { supabase } from "./supabase.js"

// Sản phẩm
export async function getProducts(options = {}) {
  const { category, minPrice, maxPrice, search, limit, page = 1 } = options

  let query = supabase.from("products").select("*")

  // Áp dụng các bộ lọc
  if (category) {
    query = query.eq("category_id", category)
  }

  if (minPrice) {
    query = query.gte("price", minPrice)
  }

  if (maxPrice) {
    query = query.lte("price", maxPrice)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  // Phân trang
  if (limit) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    throw error
  }

  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    throw error
  }

  return data
}

// Danh mục
export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*")

  if (error) {
    console.error("Error fetching categories:", error)
    throw error
  }

  return data
}

// Đơn hàng
export async function createOrder(orderData) {
  const { data, error } = await supabase.from("orders").insert(orderData).select()

  if (error) {
    console.error("Error creating order:", error)
    throw error
  }

  return data[0]
}

export async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    throw error
  }

  return data
}
