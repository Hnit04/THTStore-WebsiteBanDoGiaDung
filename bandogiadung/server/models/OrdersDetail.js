const mongoose = require("mongoose");

const OrderDetailSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    required: true,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("OrderDetail", OrderDetailSchema);
