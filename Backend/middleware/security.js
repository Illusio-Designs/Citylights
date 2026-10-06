// Lightweight security middleware (no extra dependencies).

// Basic security headers (subset of what helmet sets).
exports.securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.removeHeader('X-Powered-By');
    next();
};

// Fixed-window in-memory rate limiter keyed by client IP (per process).
exports.rateLimit = ({ windowMs, max, message = 'Too many requests, please try again later.' }) => {
    const hits = new Map();

    const timer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) {
            if (entry.resetAt <= now) hits.delete(key);
        }
    }, Math.max(windowMs, 60 * 1000));
    if (timer.unref) timer.unref();

    return (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        let entry = hits.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(key, entry);
        }
        entry.count += 1;
        if (entry.count > max) {
            res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
            return res.status(429).json({ success: false, message });
        }
        next();
    };
};

// CORS origin check driven by CORS_ORIGINS (comma separated). Unset = allow all
// (previous behaviour) so existing deployments don't break; set it in production.
exports.corsOptions = () => {
    const allowed = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((o) => o.trim().replace(/\/$/, ''))
        .filter(Boolean);
    if (allowed.length === 0) return {};
    return {
        origin: (origin, cb) => {
            if (!origin || allowed.includes(origin.replace(/\/$/, ''))) return cb(null, true);
            return cb(null, false);
        },
    };
};
