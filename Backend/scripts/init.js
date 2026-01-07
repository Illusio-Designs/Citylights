const { sequelize, User, Contact, PhoneSubmission, Appointment, HelpRequest } = require('../models');
const bcrypt = require('bcryptjs');

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
        console.log('Setting up new tables only (SEO table already exists)');
        console.log('Admin Credentials:');
        console.log(`Email: ${DEFAULT_ADMIN.email}`);
        console.log(`Password: ${DEFAULT_ADMIN.password}`);
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