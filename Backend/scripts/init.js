const { sequelize, User, Contact, PhoneSubmission, Appointment, HelpRequest } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Default admin credentials
const DEFAULT_ADMIN = {
    email: process.env.ADMIN_EMAIL || 'admin@citylights.com',
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
        console.log('Setting up database tables...');
        await sequelize.authenticate();
        console.log('Database connection established');

        // Try to sync each model individually for better error reporting
        console.log('Creating contacts table...');
        await Contact.sync({ alter: false });
        
        console.log('Creating phone_submissions table...');
        await sequelize.getQueryInterface().createTable('phone_submissions', {
            id: {
                type: sequelize.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            phone: {
                type: sequelize.Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: sequelize.Sequelize.ENUM('pending', 'contacted', 'converted'),
                defaultValue: 'pending'
            },
            created_at: {
                type: sequelize.Sequelize.DATE,
                defaultValue: sequelize.Sequelize.NOW
            },
            updated_at: {
                type: sequelize.Sequelize.DATE,
                defaultValue: sequelize.Sequelize.NOW
            }
        });
        
        console.log('Creating appointments table...');
        await Appointment.sync({ alter: false });
        
        console.log('Creating help_requests table...');
        await HelpRequest.sync({ alter: false });
        
        console.log('All new tables synced successfully');
        return true;
    } catch (error) {
        console.error('Error during database setup:', error.message);
        console.error('Full error:', error);
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

        // Password comes from ADMIN_PASSWORD; if unset a random one is generated and
        // printed once on creation. It is never a hardcoded value.
        const generated = !process.env.ADMIN_PASSWORD;
        const initialPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
        const hashedPassword = await bcrypt.hash(initialPassword, 10);

        const [adminUser, created] = await User.findOrCreate({
            where: { email: DEFAULT_ADMIN.email },
            defaults: {
                ...DEFAULT_ADMIN,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        if (created) {
            console.log(`Admin user created: ${DEFAULT_ADMIN.email}`);
            if (generated) {
                console.log(`Generated admin password (shown once, change it after login): ${initialPassword}`);
            }
        } else {
            // Never overwrite an existing admin's password on restart.
            // Set ADMIN_RESET_PASSWORD=true together with ADMIN_PASSWORD to force a reset.
            const updates = { status: 'active', updated_at: new Date() };
            if (process.env.ADMIN_RESET_PASSWORD === 'true' && process.env.ADMIN_PASSWORD) {
                updates.password = hashedPassword;
                console.log('Admin password reset from ADMIN_PASSWORD');
            }
            await adminUser.update(updates);
            console.log('Admin user already exists');
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
        console.log('Setting up new tables only (SEO table already exists)');
        console.log('=======================================');

        // Setup database structure for new tables only
        const dbSetup = await setupDatabase();
        if (!dbSetup) {
            throw new Error('Database setup failed');
        }

        // Setup admin user
        const adminSetup = await setupAdminUser();
        if (!adminSetup) {
            throw new Error('Admin user setup failed');
        }

        console.log('Setup completed successfully (SEO table left unchanged)');
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