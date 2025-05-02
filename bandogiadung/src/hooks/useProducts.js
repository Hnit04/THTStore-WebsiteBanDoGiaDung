
"use client"

import { useState, useEffect, useMemo } from "react"
import { getProducts } from "../lib/api.js"

// Utility to deeply compare objects for dependency checking
function isEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
  }
  return true;
}

export function useProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    limit: options.limit || undefined,
    category: Array.isArray(options.category) ? options.category : [],
    search: options.search || "",
    minPrice: options.minPrice || 0,
    maxPrice: options.maxPrice || Number.MAX_SAFE_INTEGER,
  }), [options.limit, options.category, options.search, options.minPrice, options.maxPrice]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getProducts({
          limit: memoizedOptions.limit,
          // Pass other options to API if supported
        });

        // Client-side filtering
        let filteredProducts = data;

        // Filter by categories (multiple)
        if (memoizedOptions.category.length > 0) {
          filteredProducts = filteredProducts.filter((product) =>
            memoizedOptions.category.includes(product.categoryId)
          );
        }

        // Filter by name
        if (memoizedOptions.search) {
          filteredProducts = filteredProducts.filter((product) =>
            product.name.toLowerCase().includes(memoizedOptions.search.toLowerCase())
          );
        }

        // Filter by price range
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.price >= memoizedOptions.minPrice &&
            product.price <= memoizedOptions.maxPrice
        );

        setProducts(filteredProducts);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải sản phẩm");
        console.error("Error in useProducts hook:", err);
        setProducts([]); // Clear products on error to avoid stale data
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [memoizedOptions]); // Only re-run if memoizedOptions changes

  return { products, loading, error };
}
