"use client"

import { useState, useEffect } from "react"
import { getProducts } from "../lib/api.js"

export function useProducts(options = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await getProducts(options)
        setProducts(data)
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải sản phẩm")
        console.error("Error in useProducts hook:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [options])

  return { products, loading, error }
}
