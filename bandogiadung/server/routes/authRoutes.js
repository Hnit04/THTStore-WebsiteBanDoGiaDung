// routes/authRoutes.js
const express = require("express")
const { register, login, getMe, logout, verifyEmail } = require("../controllers/authController")

const router = express.Router()

const { protect } = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.post("/verify-email", verifyEmail)
router.get("/me", protect, getMe)
router.post("/logout", protect, logout)

module.exports = router