const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      product_name: {
        type: String,
        required: true,
      },
      product_price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Số lượng không được nhỏ hơn 1"],
      },
    },
  ],
  total_amount: {
    type: Number,
    required: true,
  },
  shipping_address: {
    type: String,
    required: true,
  },
  shipping_city: {
    type: String,
    required: true,
  },
  shipping_postalCode: {
    type: String,
  },
  shipping_country: {
    type: String,
    default: "Vietnam",
  },
  payment_method: {
    type: String,
    required: true,
    enum: ["cod", "banking", "momo", "zalopay"],
  },
  payment_status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Order", OrderSchema)
