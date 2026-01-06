const { sequelize, User, Store, Seo } = require('../models');
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

// Default SEO data for common pages
const DEFAULT_SEO_DATA = [
    {
        path: '/',
        title: 'Vivera Lighting - Premium Lighting Solutions',
        description: 'Discover premium lighting for every space. Explore stores, collections, and featured products at Vivera Lighting.',
        keywords: 'lighting, vivera lighting, home lighting, featured products, stores',
        og_title: 'Vivera Lighting - Premium Lighting Solutions',
        og_description: 'Discover premium lighting products and stores at Vivera Lighting.',
        og_image: null,
        noindex: false
    },
    {
        path: '/about',
        title: 'About Vivera Lighting - Our Story & Mission',
        description: 'Learn about Vivera Lighting—our story, mission, and commitment to quality illumination.',
        keywords: 'about vivera lighting, mission, brand story, lighting company',
        og_title: 'About Vivera Lighting',
        og_description: 'Learn about our story, mission, and commitment to quality illumination.',
        og_image: null,
        noindex: false
    },
    {
        path: '/contact',
        title: 'Contact Vivera Lighting - Support & Sales',
        description: 'Contact Vivera Lighting for support, sales inquiries, or store partnerships.',
        keywords: 'contact vivera lighting, support, sales, partnership',
        og_title: 'Contact Vivera Lighting',
        og_description: 'Get in touch for support, sales inquiries, or store partnerships.',
        og_image: null,
        noindex: false
    },
    {
        path: '/products',
        title: 'Vivera Lighting Products - Fixtures & Luminaires',
        description: 'Browse all Vivera Lighting products. Find the perfect fixtures and luminaires for your needs.',
        keywords: 'vivera products, lighting products, luminaires, fixtures',
        og_title: 'Vivera Lighting Products',
        og_description: 'Browse our complete collection of lighting products and fixtures.',
        og_image: null,
        noindex: false
    },
    {
        path: '/collection',
        title: 'Lighting Collections - Curated Styles by Vivera',
        description: 'Explore curated lighting collections from Vivera Lighting—styles for every interior.',
        keywords: 'lighting collections, curated lights, interior lighting styles',
        og_title: 'Vivera Lighting Collections',
        og_description: 'Explore our curated lighting collections for every interior style.',
        og_image: null,
        noindex: false
    },
    {
        path: '/store',
        title: 'Vivera Lighting Stores - Find Showrooms Near You',
        description: 'Find Vivera Lighting stores and showrooms near you. Discover authorized partners.',
        keywords: 'lighting stores, vivera stores, showrooms, authorized partners',
        og_title: 'Vivera Lighting Stores',
        og_description: 'Find our stores and showrooms near you.',
        og_image: null,
        noindex: false
    }
];

/**
 * Sets up the database structure
 * @returns {Promise<boolean>} Success status
 */
async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        await sequelize.authenticate();
        console.log('Database connection established');

        // Sync all models with alter: false to avoid "too many keys" error
        await sequelize.sync({ alter: false });
        
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
 * Sets up default SEO data for common pages
 * @returns {Promise<boolean>} Success status
 */
async function setupSeoData() {
    try {
        console.log('Setting up default SEO data...');
        
        let createdCount = 0;
        let updatedCount = 0;
        
        for (const seoData of DEFAULT_SEO_DATA) {
            const [seoRecord, created] = await Seo.findOrCreate({
                where: { path: seoData.path },
                defaults: {
                    ...seoData,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            if (created) {
                createdCount++;
                console.log(`Created SEO data for path: ${seoData.path}`);
            } else {
                // Optionally update existing SEO data (uncomment if needed)
                // await seoRecord.update({
                //     ...seoData,
                //     updated_at: new Date()
                // });
                updatedCount++;
                console.log(`SEO data already exists for path: ${seoData.path}`);
            }
        }

        console.log(`SEO setup completed: ${createdCount} created, ${updatedCount} already existed`);
        return true;
    } catch (error) {
        console.error('Error setting up SEO data:', error.message);
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

        // Setup default SEO data
        const seoSetup = await setupSeoData();
        if (!seoSetup) {
            throw new Error('SEO data setup failed');
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
    setupSeoData,
    setupAll,
    DEFAULT_ADMIN,
    DEFAULT_SEO_DATA
};

// Run setup if this file is run directly
if (require.main === module) {
    setupAll();
} 