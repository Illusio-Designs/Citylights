const { User, Store } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { compressImage } = require("../config/multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const { getJwtSecret } = require("../config/jwt");
const { isValidEmail, MIN_PASSWORD_LENGTH } = require("../utils/validators");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Delete the temp upload (if any) after a failed/rejected request
const removeUpload = (req) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err && err.code !== "ENOENT") console.error("Error deleting file:", err);
    });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.userType,
    },
    getJwtSecret(),
    { expiresIn: "24h" }
  );
};

const publicUser = (user) => {
  const data = user.toJSON();
  delete data.password;
  delete data.resetToken;
  delete data.resetTokenExpiry;
  return data;
};

// Register new user
// Public sign-up can only create store owners; creating an admin requires an admin token.
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, userType, storeId } =
      req.body;

    // Validate required fields
    if (!fullName || !email || !password || !userType) {
      removeUpload(req);
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      removeUpload(req);
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      removeUpload(req);
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    // Validate user type
    if (!["admin", "storeowner"].includes(userType)) {
      removeUpload(req);
      return res.status(400).json({ message: "Invalid user type" });
    }

    if (userType === "admin" && !(req.user && req.user.userType === "admin")) {
      removeUpload(req);
      return res
        .status(403)
        .json({ message: "Only an admin can create admin accounts" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      removeUpload(req);
      return res.status(400).json({ message: "User already exists" });
    }

    // If storeId is provided, validate that the store exists
    if (storeId) {
      const store = await Store.findByPk(storeId);
      if (!store) {
        removeUpload(req);
        return res.status(400).json({ message: "Store not found" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile image if uploaded (stored as a filename in uploads/profile)
    let profileImage = null;
    if (req.file) {
      profileImage = await compressImage(req.file.path);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType,
      storeId: storeId || null, // Set to null if not provided
      profileImage,
      status: "active",
      authProvider: "local",
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: publicUser(user),
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    removeUpload(req);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    // Never trust an unverified Google email (account takeover risk)
    if (!email || !email_verified) {
      return res.status(401).json({ message: "Google email is not verified" });
    }

    // Find or create user
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user
      user = await User.create({
        fullName: name,
        email,
        googleId,
        profileImage: picture,
        userType: "storeowner", // Default type for Google users
        status: "active",
        authProvider: "google",
      });
    } else if (user.status !== "active") {
      return res.status(401).json({ message: "Account is not active" });
    } else if (!user.googleId) {
      // Link Google ID but keep authProvider, so password login keeps working
      await user.update({ googleId });
    } else if (user.googleId !== googleId) {
      return res.status(401).json({ message: "Google account mismatch" });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const jwtToken = generateToken(user);

    res.json({
      message: "Google login successful",
      user: publicUser(user),
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

// Regular login (update existing login function)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Store,
          attributes: ["name", "email"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({ message: "Account is not active" });
    }

    // Google-only accounts have no password
    if (!user.password) {
      return res.status(401).json({ message: "Please use Google login" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user);

    // Send response with token
    res.json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const genericResponse = {
      message: "If an account exists for that email, a reset link has been sent",
    };

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const user = await User.findOne({ where: { email } });
    // Same response whether or not the account exists (no user enumeration)
    if (!user || user.status !== "active") {
      return res.json(genericResponse);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Save reset token to user
    // Only a hash of the token is stored; the raw token only travels by email
    await user.update({
      resetToken: hashToken(resetToken),
      resetTokenExpiry,
    });

    // Create email transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request - Citylights",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${escapeHtml(user.fullName)},</p>
                    <p>We received a request to reset your password for your Citylights account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                        ${resetUrl}
                    </p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message, please do not reply to this email.
                    </p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Token and a new password of at least ${MIN_PASSWORD_LENGTH} characters are required`,
      });
    }

    const user = await User.findOne({
      where: {
        resetToken: hashToken(String(token)),
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword || String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Current password and a new password of at least ${MIN_PASSWORD_LENGTH} characters are required`,
      });
    }

    if (!req.user.password) {
      return res.status(400).json({ message: "This account has no password set" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password || ""
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};
