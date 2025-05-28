const { User, Store } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { compressImage } = require('../config/multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
    try {
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                userType: user.userType
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('Generated token:', token); // For debugging
        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw error;
    }
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, userType, storeId } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !userType) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate user type
        if (!['admin', 'storeowner'].includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // If storeId is provided, validate that the store exists
        if (storeId) {
            const store = await Store.findByPk(storeId);
            if (!store) {
                return res.status(400).json({ message: 'Store not found' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            const outputPath = path.join(__dirname, '../uploads', `profile-${Date.now()}.jpg`);
            await compressImage(req.file.path, outputPath);
            profileImage = outputPath;
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
            status: 'active',
            authProvider: 'local'
        });

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            token
        });
    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Google login
exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Find or create user
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new user
            user = await User.create({
                fullName: name,
                email,
                googleId,
                profileImage: picture,
                userType: 'storeowner', // Default type for Google users
                status: 'active',
                authProvider: 'google'
            });
        } else if (user.authProvider === 'local') {
            // Link Google account to existing local account
            await user.update({
                googleId,
                authProvider: 'google',
                profileImage: picture
            });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        // Generate token
        const jwtToken = generateToken(user);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            message: 'Google login successful',
            user: userResponse,
            token: jwtToken
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

// Regular login (update existing login function)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ 
            where: { email },
            include: [{
                model: Store,
                attributes: ['name', 'email']
            }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        // Check if user is Google-authenticated
        if (user.authProvider === 'google') {
            return res.status(401).json({ message: 'Please use Google login' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        // Send response with token
        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

        // Save reset token to user
        await user.update({
            resetToken,
            resetTokenExpiry
        });

        // Create email transporter with Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log('Reset URL:', resetUrl); // For debugging

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request - Citylights',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.fullName},</p>
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
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Reset email sent successfully to:', user.email);

        res.json({ 
            message: 'Password reset email sent successfully',
            resetUrl: resetUrl // For testing purposes
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            message: 'Error sending reset email',
            error: error.message 
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await user.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        });

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await user.update({ password: hashedPassword });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
}; 