const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const { setupAll, DEFAULT_ADMIN } = require('./scripts/init');
require('dotenv').config({ path: path.join(__dirname, 'env.config') });

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

// Start server
const PORT = process.env.PORT || 3000;

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Run initialization script
    const initSuccess = await setupAll();
    if (!initSuccess) {
      throw new Error('Database initialization failed');
    }
    
    // Sync all models
    await sequelize.sync();
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