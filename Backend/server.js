// Load environment variables FIRST before any other imports
const fs = require('fs');
const path = require('path');

// Custom environment loader (consolidated from config/env.js)
function loadEnvConfig() {
    const envPath = path.join(__dirname, 'env.config');
    
    try {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            
            lines.forEach(line => {
                // Skip empty lines and comments
                if (line.trim() && !line.trim().startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        const value = valueParts.join('=').trim();
                        // Only set if not already set in process.env
                        if (!process.env[key.trim()]) {
                            process.env[key.trim()] = value;
                        }
                    }
                }
            });
            
            console.log('✅ Environment configuration loaded successfully');
        } else {
            console.warn('⚠️  env.config file not found, using default environment variables');
        }
    } catch (error) {
        console.error('❌ Error loading env.config:', error);
    }
}

// Setup upload directories (consolidated from setup-production.js)
function setupUploadDirectories() {
    const uploadsDir = path.join(__dirname, 'uploads');
    const requiredDirs = [
        'collections',
        'products', 
        'images',
        'logos',
        'profile',
        'sliders',
        'seo'
    ];

    requiredDirs.forEach(dir => {
        const dirPath = path.join(uploadsDir, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created directory: uploads/${dir}`);
        }
    });
}

// Load environment configuration
loadEnvConfig();

// Also try dotenv as fallback
require('dotenv').config({ path: path.join(__dirname, 'env.config') });

// Setup upload directories
setupUploadDirectories();

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
const seoRoutes = require('./routes/seoRoutes');
const contactRoutes = require('./routes/contactRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const helpRoutes = require('./routes/helpRoutes');
const { setupAll } = require('./scripts/init');
const { securityHeaders, rateLimit, corsOptions } = require('./middleware/security');

const app = express();

// Middleware
app.disable('x-powered-by');
// Honour X-Forwarded-For when behind a reverse proxy (needed for per-IP rate limiting)
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors(corsOptions()));
app.use(express.json({ limit: '1mb' }));

// Rate limiting: strict on auth, moderate on public form submissions
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many attempts, please try again later.' });
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api/auth', authLimiter);
app.use('/api/contact/submit', formLimiter);
app.use('/api/phone/submit', formLimiter);
app.use('/api/appointments/book', formLimiter);
app.use('/api/help/submit', formLimiter);
app.post('/api/reviews', formLimiter);
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
app.use('/api/seo', seoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/help', helpRoutes);

// Health check (no sensitive data)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Citylights API' });
});

// Multer / generic error handler (returns JSON instead of an HTML stack trace)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err && (err.name === 'MulterError' || /image|Not an image/i.test(err.message || ''))) {
    return res.status(400).json({ message: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;

// Database connection and server start
async function startServer() {
  try {
    // Validate critical environment variables
    const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\nPlease check your env.config file.');
      process.exit(1);
    }

    console.log('✅ All required environment variables are set');
    console.log(`📋 Configuration: ${process.env.DB_NAME}@${process.env.DB_HOST}`);

    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Run initialization script
    console.log('🔄 Running database initialization...');
    const initSuccess = await setupAll();
    if (!initSuccess) {
      console.error('❌ Database initialization failed - check your database permissions');
      throw new Error('Database initialization failed');
    }
    
    // Sync all models to ensure tables are created
    console.log('🔄 Syncing database models...');
    try {
      await sequelize.sync({ alter: false });
      console.log('✅ All models synchronized successfully');
    } catch (syncError) {
      console.error('❌ Model sync failed:', syncError.message);
      throw syncError;
    }

    // List all tables to verify creation
    try {
      const queryInterface = sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      console.log('📋 Database tables found:', tables);
      
      // Check specifically for our new tables
      const newTables = ['contacts', 'phone_submissions', 'appointments', 'help_requests'];
      const missingTables = newTables.filter(table => !tables.includes(table));
      
      if (missingTables.length > 0) {
        console.warn('⚠️  Missing tables:', missingTables);
      } else {
        console.log('✅ All required tables exist');
      }
    } catch (tableError) {
      console.warn('⚠️  Could not list tables:', tableError.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('🎉 Citylights API is ready!');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer(); 