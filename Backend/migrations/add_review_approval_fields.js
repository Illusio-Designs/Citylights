const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

async function addReviewApprovalFields() {
  try {
    console.log('🔄 Starting migration to add review approval fields...');
    
    // Check if columns already exist
    const [existingColumns] = await sequelize.query(`
      SHOW COLUMNS FROM Reviews LIKE 'status'
    `);
    
    if (existingColumns.length === 0) {
      // Add status column
      await sequelize.query(`
        ALTER TABLE Reviews 
        ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'
      `);
      console.log('✅ Added status column');
    } else {
      console.log('ℹ️ Status column already exists');
    }
    
    const [existingRatingColumns] = await sequelize.query(`
      SHOW COLUMNS FROM Reviews LIKE 'rating'
    `);
    
    if (existingRatingColumns.length === 0) {
      // Add rating column
      await sequelize.query(`
        ALTER TABLE Reviews 
        ADD COLUMN rating INT
      `);
      console.log('✅ Added rating column');
    } else {
      console.log('ℹ️ Rating column already exists');
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error adding review approval fields:', error);
    throw error;
  }
}

// Run the migration
addReviewApprovalFields()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 