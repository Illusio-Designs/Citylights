// Single source for the JWT secret. No hardcoded fallback: the server refuses to
// start without JWT_SECRET (validated in server.js) and signing/verifying throws.
exports.getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'undefined') {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
};
