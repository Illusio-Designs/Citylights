#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const ASSETS_DIR = path.join(__dirname, 'src/assets');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg'];
const QUALITY = 80;

/**
 * Convert a single image to WebP format
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    
    console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    
    // Delete original file after successful conversion
    fs.unlinkSync(inputPath);
    console.log(`🗑️  Removed: ${path.basename(inputPath)}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Find and convert new images that don't have WebP equivalents
 */
async function convertNewImages() {
  console.log('🔍 Checking for new images to convert...');
  
  // Check if Sharp is available
  try {
    require('sharp');
  } catch (error) {
    console.log('ℹ️  Sharp not available, skipping image conversion');
    return;
  }
  
  // Check if assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log('ℹ️  Assets directory not found, skipping conversion');
    return;
  }
  
  const items = fs.readdirSync(ASSETS_DIR);
  const imagesToConvert = [];
  
  // Find images that need conversion
  for (const item of items) {
    const fullPath = path.join(ASSETS_DIR, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        const baseName = path.basename(item, ext);
        const webpPath = path.join(ASSETS_DIR, `${baseName}.webp`);
        
        // Only convert if WebP version doesn't exist
        if (!fs.existsSync(webpPath)) {
          imagesToConvert.push({
            original: fullPath,
            webp: webpPath,
            name: item
          });
        }
      }
    }
  }
  
  if (imagesToConvert.length === 0) {
    console.log('✅ No new images to convert');
    return;
  }
  
  console.log(`📁 Found ${imagesToConvert.length} new images to convert:`);
  
  let converted = 0;
  
  // Convert each image
  for (const img of imagesToConvert) {
    console.log(`🔄 Converting: ${img.name}`);
    const success = await convertToWebP(img.original, img.webp);
    if (success) {
      converted++;
    }
  }
  
  console.log(`\n📊 Conversion Summary: ${converted}/${imagesToConvert.length} images converted`);
  
  if (converted > 0) {
    console.log('🎉 New images converted to WebP format!');
    console.log('💡 Remember to update your code to use .webp extensions');
  }
}

// Run the conversion
if (require.main === module) {
  convertNewImages().catch(error => {
    console.error('💥 Conversion failed:', error);
    process.exit(1);
  });
}

module.exports = { convertNewImages };
