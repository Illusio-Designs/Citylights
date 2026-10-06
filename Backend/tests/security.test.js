// Route-level security regression tests. No database is needed: every request here
// is rejected by the auth / validation layer before any query runs.
//
// Run with: npm test
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { securityHeaders, rateLimit } = require('../middleware/security');

const routes = {
    auth: 'authRoutes',
    users: 'userRoutes',
    stores: 'storeRoutes',
    collections: 'collectionRoutes',
    products: 'productRoutes',
    reviews: 'reviewRoutes',
    sliders: 'sliderRoutes',
    orders: 'orderRoutes',
    seo: 'seoRoutes',
    contact: 'contactRoutes',
    phone: 'phoneRoutes',
    appointments: 'appointmentRoutes',
    help: 'helpRoutes',
};

let server;
let base;

const call = async (method, url, body) => {
    const res = await fetch(base + url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        // A request that reaches the (absent) database would hang; fail fast instead
        signal: AbortSignal.timeout(5000),
    });
    return res;
};

test.before(async () => {
    const app = express();
    app.use(securityHeaders);
    app.use(express.json());
    app.use('/api/auth', rateLimit({ windowMs: 60 * 1000, max: 5 }), require('../routes/authRoutes'));
    for (const [mount, file] of Object.entries(routes)) {
        if (mount === 'auth') continue;
        app.use('/api/' + mount, require('../routes/' + file));
    }
    await new Promise((resolve) => { server = app.listen(0, resolve); });
    base = 'http://127.0.0.1:' + server.address().port;
});

test.after(() => new Promise((resolve) => {
    server.close(resolve);
    // sequelize / timers are unref'd, but make sure the runner can exit
    setTimeout(() => process.exit(0), 100).unref();
}));

const protectedEndpoints = [
    ['POST', '/api/collections'], ['PUT', '/api/collections/1'], ['DELETE', '/api/collections/1'],
    ['POST', '/api/sliders'], ['PUT', '/api/sliders/1'], ['DELETE', '/api/sliders/1'],
    ['POST', '/api/sliders/cleanup-missing-images'],
    ['POST', '/api/stores'], ['PUT', '/api/stores/1'], ['DELETE', '/api/stores/1'],
    ['POST', '/api/seo'], ['GET', '/api/seo/all'],
    ['GET', '/api/users'], ['GET', '/api/users/1'], ['POST', '/api/users'], ['PUT', '/api/users/1'], ['DELETE', '/api/users/1'],
    ['GET', '/api/orders'], ['POST', '/api/orders'], ['PUT', '/api/orders/1/approve'], ['PUT', '/api/orders/1/reject'],
    ['POST', '/api/products'], ['PUT', '/api/products/1'], ['DELETE', '/api/products/1'],
    ['GET', '/api/reviews'], ['PUT', '/api/reviews/1/approve'], ['DELETE', '/api/reviews/1'],
    ['GET', '/api/contact'], ['GET', '/api/phone'], ['GET', '/api/appointments'], ['GET', '/api/help'],
];

for (const [method, url] of protectedEndpoints) {
    test(`${method} ${url} requires authentication`, async () => {
        const res = await call(method, url);
        assert.equal(res.status, 401);
    });
}

test('public sign-up cannot create an admin account', async () => {
    const res = await call('POST', '/api/auth/register', {
        fullName: 'Mallory', email: 'mallory@example.com', password: 'longenough1', userType: 'admin',
    });
    assert.equal(res.status, 403);
});

test('sign-up rejects a short password', async () => {
    const res = await call('POST', '/api/auth/register', {
        fullName: 'Bob', email: 'bob@example.com', password: 'short', userType: 'storeowner',
    });
    assert.equal(res.status, 400);
});

test('login requires email and password', async () => {
    const res = await call('POST', '/api/auth/login', {});
    assert.equal(res.status, 400);
});

test('security headers are set', async () => {
    const res = await call('GET', '/api/seo?page_name=');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
});

test('auth endpoints are rate limited', async () => {
    let last;
    for (let i = 0; i < 8; i++) last = await call('POST', '/api/auth/login', {});
    assert.equal(last.status, 429);
});
