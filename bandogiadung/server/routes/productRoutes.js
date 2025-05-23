const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/").get(getProducts).post(protect, authorize("admin"), createProduct);

router
    .route("/:_id")
    .get(getProduct)
    .put(protect, authorize("admin"), updateProduct)
    .delete(protect, authorize("admin"), deleteProduct);


module.exports = router;