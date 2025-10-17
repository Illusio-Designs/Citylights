const express = require("express");
const router = express.Router();
const { upload } = require("../config/multer");
const { authenticateToken } = require("../middleware/auth");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  getProductFilterOptions,
} = require("../controllers/productController");

// Product routes - protected with authentication
router.post("/", authenticateToken, upload.any(), createProduct);
router.get("/", getProducts); // Public route for getting products
router.get("/filter-options", getProductFilterOptions); // Get filter options
router.get("/:name", getProduct); // Public route for getting single product
router.put("/:id", authenticateToken, upload.any(), updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

// Product image routes - protected with authentication
router.post("/images", authenticateToken, upload.single("product_image"), uploadProductImage);
router.delete("/images/:imageId", authenticateToken, deleteProductImage);

module.exports = router;
