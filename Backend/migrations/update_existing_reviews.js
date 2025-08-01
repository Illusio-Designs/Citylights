const sequelize = require('../config/db');

async function updateExistingReviews() {
  try {
    console.log('🔄 Updating existing reviews with default status...');
    
    // Update existing reviews that don't have a status to 'approved'
    const [result] = await sequelize.query(`
      UPDATE Reviews 
      SET status = 'approved' 
      WHERE status IS NULL OR status = ''
    `);
    
    console.log(`✅ Updated ${result.affectedRows} existing reviews to 'approved' status`);
    
    // Check if rating column exists, if not add it
    const [existingRatingColumns] = await sequelize.query(`
      SHOW COLUMNS FROM Reviews LIKE 'rating'
    `);
    
    if (existingRatingColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE Reviews 
        ADD COLUMN rating INT
      `);
      console.log('✅ Added rating column');
    } else {
      console.log('ℹ️ Rating column already exists');
    }
    
    console.log('✅ All existing reviews updated successfully!');
  } catch (error) {
    console.error('❌ Error updating existing reviews:', error);
    throw error;
  }
}

// Run the migration
updateExistingReviews()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 