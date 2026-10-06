exports.EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.isValidEmail = (v) => typeof v === 'string' && exports.EMAIL_RE.test(v.trim());

// Positive whole number (accepts numeric strings from form bodies).
exports.toPositiveInt = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};

exports.MIN_PASSWORD_LENGTH = 8;

// Clamp pagination input from the query string.
exports.parsePagination = (rawPage, rawLimit, maxLimit = 100) => {
    const page = Math.max(parseInt(rawPage, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 10, 1), maxLimit);
    return { page, limit, offset: (page - 1) * limit };
};
