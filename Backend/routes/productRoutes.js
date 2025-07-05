const express = require("express");
const router = express.Router();
const { upload } = require("../config/multer");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} = require("../controllers/productController");

// Product routes
router.post("/", upload.any(), createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", upload.any(), updateProduct);
router.delete("/:id", deleteProduct);

// Product image routes
router.post("/images", upload.single("product_image"), uploadProductImage);
router.delete("/images/:id", deleteProductImage);

module.exports = router;
