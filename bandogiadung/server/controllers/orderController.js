// controllers/orderController.js
const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders/orderCustomer
// @access  Public (tạm thời bỏ kiểm tra admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    console.log('Gọi getAllOrders với query:', req.query);
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        console.error('Invalid date format:', { startDate, endDate });
        return res.status(400).json({ success: false, error: 'Invalid date format' });
      }
      query.created_at = { $gte: start, $lte: end };
    }

    console.log('MongoDB Query:', query);
    const orders = await Order.find(query).sort({ created_at: -1 });

    console.log('Danh sách đơn hàng:', orders);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error('Lỗi khi gọi getAllOrders:', err);
    next(err);
  }
};
// @desc    Get orders of current user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
<<<<<<< HEAD
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ success: false, error: 'Invalid date format' });
      }
      query.created_at = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error('Error in getUserOrders:', err);
    next(err);
  }
};
=======
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
>>>>>>> 356dd374f8794b268fe07024838c4f5deb7f4d9e

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

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        // Thêm user ID vào req.body
        req.body.user = req.user.id

        const order = await Order.create(req.body)

        res.status(201).json({
            success: true,
            data: order,
        })
    } catch (err) {
        next(err)
    }
}

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

<<<<<<< HEAD

=======
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
>>>>>>> 356dd374f8794b268fe07024838c4f5deb7f4d9e

