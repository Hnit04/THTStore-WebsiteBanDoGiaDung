import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  if (amount === 0) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}


// Format date based on the specified format
export const formatDate = (dateInput, format = "YYYY-MM-DD") => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date)) {
    console.warn(`Invalid date input: ${dateInput}`);
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM":
      return `${day}/${month}`;
    default:
      return date.toLocaleDateString("vi-VN");
  }
};

export function generateOrderId() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
