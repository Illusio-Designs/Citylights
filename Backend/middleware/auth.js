const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getJwtSecret } = require('../config/jwt');

const extractToken = (req) => {
    const authHeader = req.headers['authorization'];
    return authHeader && authHeader.split(' ')[1];
};

// Resolve the user for a token, or throw (jwt errors / inactive account).
const resolveUser = async (token) => {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findByPk(decoded.id);
    if (!user) {
        const err = new Error('User not found');
        err.status = 401;
        throw err;
    }
    if (user.status !== 'active') {
        const err = new Error('Account is not active');
        err.status = 401;
        throw err;
    }
    return user;
};

exports.authenticateToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ message: 'Authentication token required' });
        }
        req.user = await resolveUser(token);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        if (error.status === 401) {
            return res.status(401).json({ message: error.message });
        }
        if (error.message === 'JWT_SECRET is not configured') {
            console.error(error.message);
            return res.status(500).json({ message: 'Server configuration error' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Attaches req.user when a valid token is present, otherwise continues anonymously.
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) req.user = await resolveUser(token);
    } catch (_) {
        req.user = undefined;
    }
    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

// Allows the admin, or the user whose id matches req.params[param].
exports.requireSelfOrAdmin = (param = 'id') => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.userType === 'admin' || String(req.user.id) === String(req.params[param])) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied' });
};
