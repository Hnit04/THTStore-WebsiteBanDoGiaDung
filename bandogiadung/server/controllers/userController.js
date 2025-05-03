const User = require("../models/User")
const bcrypt = require("bcrypt")
const Order = require("../models/Order")

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email }); // Tìm theo email

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const Product = require('../models/Product');

exports.getAllOrders = async (req, res, next) => {
  try {
    console.log("Gọi getAllOrders...");
    const orders = await Order.find().lean(); // Use lean() for better performance

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Lấy thông tin người dùng từ email
        const user = await User.findOne({ email: order.email }).lean();

        // Lấy thông tin sản phẩm kèm hình ảnh
        const itemsWithImages = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findOne({ id: item.product_id }).lean();
            return {
              ...item,
              image_url: product?.image_url || null,
              product_name: product?.name || item.product_name || "Unknown Product",
            };
          })
        );

        return {
          ...order,
          items: itemsWithImages,
          user_fullName: user?.fullName || "Unknown User",
          user_phone: user?.phone || "Unknown Phone",
        };
      })
    );

    res.status(200).json({
      success: true,
      count: ordersWithDetails.length,
      data: ordersWithDetails,
    });

    console.log("Danh sách đơn hàng:", ordersWithDetails);
  } catch (err) {
    console.error("Lỗi khi gọi getAllOrders:", err);
    next(err);
  }
};







// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, city, district, ward } = req.body

    // Tìm và cập nhật thông tin người dùng
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        phone,
        address,
        city,
        district,
        ward,
      },
      { new: true, runValidators: true },
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Kiểm tra xem đã cung cấp đủ thông tin chưa
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
      })
    }

    // Lấy thông tin người dùng kèm mật khẩu
    const user = await User.findById(req.user.id).select("+password")

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      })
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Mật khẩu hiện tại không đúng",
      })
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password"); // Chỉ lấy user, không lấy password

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

