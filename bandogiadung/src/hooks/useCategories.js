"use client"

import { useState, useEffect } from "react"
import { getCategories } from "../lib/api.js"

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải danh mục")
        console.error("Error in useCategories hook:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
