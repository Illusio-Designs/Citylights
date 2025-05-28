const { sequelize, User, Store } = require('../models');
const bcrypt = require('bcryptjs');
const path = require('path');

// Default admin credentials
const DEFAULT_ADMIN = {
    email: 'admin@citylights.com',
    password: 'Admin@123',
    fullName: 'System Admin',
    userType: 'admin',
    status: 'active'
};

/**
 * Sets up the database structure
 * @returns {Promise<boolean>} Success status
 */
async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        await sequelize.authenticate();
        console.log('Database connection established');

        // Sync all models with alter: true to update schema without dropping data
        await sequelize.sync({ alter: true });
        
        console.log('All tables synced');
        return true;
    } catch (error) {
        console.error('Error during database setup:', error.message);
        return false;
    }
}

/**
 * Sets up the admin user in the database
 * @returns {Promise<boolean>} Success status
 */
async function setupAdminUser() {
    try {
        console.log('Setting up admin user...');
        console.log(`Admin Email: ${DEFAULT_ADMIN.email}`);
        console.log(`Admin Password: ${DEFAULT_ADMIN.password}`);
        
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
        
        const [adminUser, created] = await User.findOrCreate({
            where: { email: DEFAULT_ADMIN.email },
            defaults: {
                ...DEFAULT_ADMIN,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        if (!created) {
            // Update existing admin user
            await adminUser.update({
                password: hashedPassword,
                status: 'active',
                updated_at: new Date()
            });
            console.log('Admin user updated successfully');
        } else {
            console.log('Admin user created successfully');
        }

        return true;
    } catch (error) {
        console.error('Error setting up admin user:', error.message);
        return false;
    }
}

/**
 * Runs all setup functions in sequence
 * @returns {Promise<void>}
 */
async function setupAll() {
    try {
        console.log('=== Citylights Database Initialization ===');
        console.log('Admin Credentials:');
        console.log(`Email: ${DEFAULT_ADMIN.email}`);
        console.log(`Password: ${DEFAULT_ADMIN.password}`);
        console.log('=======================================');

        // First setup database structure
        const dbSetup = await setupDatabase();
        if (!dbSetup) {
            throw new Error('Database setup failed');
        }

        // Then setup admin user
        const adminSetup = await setupAdminUser();
        if (!adminSetup) {
            throw new Error('Admin user setup failed');
        }

        console.log('All setup completed successfully');
        return true;
    } catch (error) {
        console.error('Error during setup:', error.message);
        return false;
    }
}

// Export individual functions for use in other files
module.exports = {
    setupDatabase,
    setupAdminUser,
    setupAll,
    DEFAULT_ADMIN
};

// Run setup if this file is run directly
if (require.main === module) {
    setupAll();
} 