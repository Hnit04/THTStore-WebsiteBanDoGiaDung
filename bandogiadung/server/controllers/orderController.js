const Order = require("../models/Order")

// @desc    Get orders of current user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.find({id: req.params.id})

    // if (!order) {
    //   return res.status(404).json({
    //     success: false,
    //     error: "Không tìm thấy đơn hàng",
    //   })
    // }

    // Đảm bảo người dùng chỉ có thể xem đơn hàng của chính họ
    // if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     error: "Không có quyền truy cập đơn hàng này",
    //   })
    // }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

const Product = require("../models/Product")
// @desc    Create new order
// @route   POST /api/orders
// @access  Private

exports.createOrder = async (req, res, next) => {
  try {
    // Đếm số đơn hàng để sinh mã đơn tiếp theo
    const count = await Order.countDocuments();
    const newOrderId = `ORD-${String(count + 1).padStart(3, "0")}`;
    req.body.id = newOrderId;

    // Nếu có xác thực user
    if (req.user && req.user.id) {
      req.body.user = req.user.id;
    }

    // Lặp qua từng item để lấy "id" từ Product và gán lại cho product_id
    for (let i = 0; i < req.body.items.length; i++) {
      const productObj = await Product.findById(req.body.items[i].product_id);

      if (!productObj) {
        return res.status(404).json({
          success: false,
          error: `Không tìm thấy sản phẩm với _id: ${req.body.items[i].product_id}`,
        });
      }

      // Gán lại product_id = productObj.id (không phải _id)
      req.body.items[i].product_id = productObj.id;
    }

    console.log("Final Order Body:", req.body); // Kiểm tra sau khi gán xong

    // Tạo đơn hàng
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy đơn hàng",
      })
    }

    // Đảm bảo người dùng chỉ có thể hủy đơn hàng của chính họ
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Không có quyền hủy đơn hàng này",
      })
    }

    // Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận hoặc đang xử lý
    if (order.status !== "pending" && order.status !== "processing") {
      return res.status(400).json({
        success: false,
        error: "Không thể hủy đơn hàng ở trạng thái này",
      })
    }

    order.status = "cancelled"
    await order.save()

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    console.log("Gọi getAllOrders...");
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
    console.log("Danh sách đơn hàng:", orders); // In ra danh sách đơn hàng
  } catch (err) {
    console.log("Lỗi khi gọi getAllOrders:", err);
    next(err);
  }
};

