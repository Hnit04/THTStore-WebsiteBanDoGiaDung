const OrderDetail = require("../models/OrdersDetail"); // Import model OrderDetail
const Order = require("../models/Order"); // Import model Order

exports.getAllOrdersWithDetails = async (req, res, next) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập vào tài nguyên này",
      });
    }

    const orderDetails = await OrderDetail.find()
      .populate({
        path: "order",
        select: "total_amount shipping_address status", // KHÔNG lấy user
      })
      .populate({
        path: "product",
        select: "name image_url",
      });
      console.log(orderDetails); // In ra orderDetails để kiểm tra dữ liệu
    // Trả về dữ liệu trực tiếp mà không kết hợp thông tin người dùng
    res.status(200).json({
      success: true,
      count: orderDetails.length,
      data: orderDetails,
    });
  } catch (err) {
    next(err);
  }
};
