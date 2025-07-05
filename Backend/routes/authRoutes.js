const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multerConfig = require("../config/multer");
const { authenticateToken } = require("../middleware/auth");

// Register new user
router.post(
  "/register",
  multerConfig.upload.single("profileImage"),
  authController.register
);

// Google login
router.post("/google-login", authController.googleLogin);

// Regular login
router.post("/login", authController.login);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password", authController.resetPassword);

// Change password (requires authentication)
router.post(
  "/change-password",
  authenticateToken,
  authController.changePassword
);

module.exports = router;
