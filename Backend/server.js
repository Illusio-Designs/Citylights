// Load environment variables FIRST before any other imports
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env.config') });

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const sliderRoutes = require('./routes/sliderRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { setupAll, DEFAULT_ADMIN } = require('./scripts/init');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/orders', orderRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Citylights API',
    defaultAdmin: {
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password
    }
  });
});

// Debug route to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV
  });
});

// Start server
const PORT = process.env.PORT || 3000;

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Run initialization script only if tables don't exist
    const initSuccess = await setupAll();
    if (!initSuccess) {
      throw new Error('Database initialization failed');
    }
    
    // Sync all models with alter: false to avoid "too many keys" error
    await sequelize.sync({ alter: false });
    console.log('All models were synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Default Admin Credentials:');
      console.log(`Email: ${DEFAULT_ADMIN.email}`);
      console.log(`Password: ${DEFAULT_ADMIN.password}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer(); 