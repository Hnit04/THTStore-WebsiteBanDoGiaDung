const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  id: { // Thêm trường id
    type: String,
    required: false, // tùy thuộc vào logic của bạn
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Vui lòng nhập tên sản phẩm"],
    trim: true,
    maxlength: [100, "Tên sản phẩm không được vượt quá 100 ký tự"],
  },
  price: {
    type: Number,
    required: [true, "Vui lòng nhập giá sản phẩm"],
    min: [0, "Giá sản phẩm không được âm"],
  },
  old_price: {
    type: Number,
    default: null,
  },
  image_url: {
    type: String,
    default: "/placeholder.svg",
  },
  description: {
    type: String,
    required: [true, "Vui lòng nhập mô tả sản phẩm"],
  },
  category_id: { // Sửa tên trường thành category_id
    type: String, // và kiểu dữ liệu thành String
    ref: 'Category', // Tham chiếu đến model Category
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  review_count: { // Đổi tên cho khớp với dữ liệu
    type: Number,
    default: 0,
  },
  is_new: { // Đổi tên cho khớp với dữ liệu
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, "Vui lòng nhập số lượng tồn kho"],
    min: [0, "Số lượng tồn kho không được âm"],
    default: 0,
  },
  createdAt: { // Đổi tên cho khớp với dữ liệu
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
