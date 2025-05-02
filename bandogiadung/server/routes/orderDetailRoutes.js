const express = require("express")
const { getAllOrdersWithDetails } = require("../controllers/orderDetailController");

const router = express.Router()

const { protect } = require("../middleware/authMiddleware")

router.get("/orderdetail", protect, getAllOrdersWithDetails)

module.exports = router
