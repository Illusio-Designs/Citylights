const {
  Product,
  ProductVariation,
  VariationAttribute,
  VariationValue,
  VariationAttributeMap,
  ProductImage,
  Collection,
} = require("../models");
const { compressImage, directories } = require("../config/multer");
const path = require("path");
const { Op } = require("sequelize");
const fs = require("fs");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log("Create product request body:", req.body);
    console.log("Create product files:", req.files);
    console.log("Number of files received:", req.files ? req.files.length : 0);

    // Extract data from FormData
    const name = req.body.name || '';
    const description = req.body.description || '';
    const collection_id = req.body.collection_id || '';
    const slug = req.body.slug || '';
    const meta_title = req.body.meta_title || '';
    const meta_desc = req.body.meta_desc || '';
    const variations = req.body.variations;
    

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Product name is required."
      });
    }

    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Product slug is required."
      });
    }

    // Check if slug already exists
    const existingProduct = await Product.findOne({ where: { slug: slug.trim() } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: "A product with this slug already exists."
      });
    }

    // Ensure collection_id is correctly validated and processed
    if (!collection_id) {
      return res.status(400).json({
        success: false,
        error: "Collection ID is required."
      });
    }

    console.log("Received collection_id:", collection_id);
    const collection = await Collection.findByPk(collection_id);
    if (!collection) {
      console.error("Collection not found for ID:", collection_id);
      return res.status(400).json({
        success: false,
        error: "Collection does not exist."
      });
    }

    console.log("Collection validation passed");

    // Proceed with product creation using the validated collection_id
    console.log("Creating product with data:", { name, description, collection_id, slug, meta_title, meta_desc });
    
    let product;
    try {
      product = await Product.create({
        name: name.trim(),
        description: description ? description.trim() : null,
        collection_id: collection_id, // Use validated collection_id
        slug: slug.trim(),
        meta_title: meta_title ? meta_title.trim() : null,
        meta_desc: meta_desc ? meta_desc.trim() : null,
      });
      console.log("Product created successfully with ID:", product.id);
    } catch (createError) {
      console.error("Error creating product:", createError);
      console.error("Validation errors:", createError.errors);
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: createError.errors ? createError.errors.map(e => e.message) : [createError.message]
      });
    }

    // Handle variations if provided
    let variationsData = [];
    if (variations) {
      console.log("Processing variations:", variations);
      try {
        variationsData = typeof variations === 'string' ? JSON.parse(variations) : variations;
        console.log("Parsed variations data:", variationsData);
      } catch (e) {
        console.error("Failed to parse variations:", e);
        return res.status(400).json({
          success: false,
          error: "Invalid variations data format."
        });
      }
    }

    if (Array.isArray(variationsData) && variationsData.length > 0) {
      console.log(`Starting to process ${variationsData.length} variations`);
      try {
      for (let i = 0; i < variationsData.length; i++) {
          console.log(`Processing variation ${i + 1}/${variationsData.length}`);
        const variation = variationsData[i];
        const { sku, price, usecase, attributes } = variation;

        // Validate required variation fields
        if (!sku || !sku.trim()) {
          throw new Error(`SKU is required for variation ${i + 1}`);
        }

        // Check for image files for this variation
        const variationImageKey = `variation_images[${i}]`;
        const variationImages = req.files ? req.files.filter(file => file.fieldname === variationImageKey) : [];
        
        // Allow variations without images for now - images can be added later
        if (variationImages.length === 0) {
          console.log(`Warning: No images provided for variation ${i + 1}. Images can be added later.`);
        }

        // Create variation
          console.log(`Creating variation ${i + 1} with data:`, { sku, price, usecase });
        const productVariation = await ProductVariation.create({
          product_id: product.id,
          sku: sku.trim(),
          price: price && !isNaN(parseFloat(price)) ? parseFloat(price) : null,
          usecase: usecase ? usecase.trim() : null,
        });

        console.log(`Created variation ${i + 1} with ID:`, productVariation.id);

        // Handle variation images
        const images = variationImages; // Use the filtered images
        console.log(`Processing ${images.length} images for variation ${i + 1}`);

        if (images.length > 0) {
          for (let j = 0; j < images.length; j++) {
          const image = images[j];
          const isPrimary = j === 0; // First image is primary
            console.log(`Processing image ${j + 1}/${images.length} for variation ${i + 1}:`, image.originalname);

          try {
            // Compress the image
              console.log(`Starting compression for image: ${image.originalname}`);
              const compressedFilename = await Promise.race([
                compressImage(image.path),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Image compression timeout')), 30000)
                )
              ]);
            console.log(`Compressed image for variation ${i + 1}:`, compressedFilename);

            // Create image record
              console.log(`Creating image record for variation ${i + 1} with filename:`, compressedFilename);
            const savedImage = await ProductImage.create({
              variation_id: productVariation.id,
              image_url: compressedFilename,
              is_primary: isPrimary,
            });

            console.log(`Saved image ${j + 1} for variation ${i + 1}:`, savedImage.id);
          } catch (imageError) {
            console.error(`Error processing image ${j + 1} for variation ${i + 1}:`, imageError);
            throw new Error(`Failed to process image ${j + 1} for variation ${i + 1}: ${imageError.message}`);
          }
          }
        }

        // Handle attributes
        if (attributes && Array.isArray(attributes)) {
          for (const attr of attributes) {
            const { name: attrName, value: attrValue } = attr;

            if (attrName && attrName.trim() && attrValue && attrValue.trim()) {
              try {
                // Find or create attribute
                let [attribute] = await VariationAttribute.findOrCreate({
                  where: { name: attrName.trim() },
                  defaults: { name: attrName.trim() }
                });

                console.log(`Found/created attribute:`, attribute.id, attribute.name);

                // Handle comma-separated values
                const values = attrValue
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);

                for (const val of values) {
                  // Find or create value
                  let [attrValueRecord] = await VariationValue.findOrCreate({
                    where: {
                      variation_attr_id: attribute.id,
                      value: val,
                    },
                    defaults: {
                      variation_attr_id: attribute.id,
                      value: val,
                    }
                  });

                  console.log(`Found/created attribute value:`, attrValueRecord.id, attrValueRecord.value);

                  // Create mapping
                  const mapping = await VariationAttributeMap.create({
                    variation_id: productVariation.id,
                    variation_value_id: attrValueRecord.id,
                  });

                  console.log(`Created attribute mapping:`, mapping.id);
                }
              } catch (attrError) {
                console.error(`Error processing attribute ${attrName}:`, attrError);
                throw new Error(`Failed to process attribute ${attrName}: ${attrError.message}`);
              }
            }
          }
        }
        }
      } catch (variationError) {
        console.error("Error processing variations:", variationError);
        return res.status(400).json({
          success: false,
          error: `Failed to process variations: ${variationError.message}`
        });
      }
    }

    // Return created product with variations and images
    console.log("Fetching created product with relations...");
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductVariation,
          include: [
            {
              model: ProductImage,
              as: "ProductImages",
            },
            {
              model: VariationAttributeMap,
              include: [
                {
                  model: VariationValue,
                  include: [VariationAttribute],
                },
              ],
            },
          ],
        },
      ],
    });

    console.log("Product created successfully:", createdProduct.id);

    res.status(201).json({
      success: true,
      data: createdProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Collection,
          attributes: ['id', 'name']
        },
        {
          model: ProductVariation,
          include: [
            { model: ProductImage, as: "ProductImages" },
            {
              model: VariationAttributeMap,
              include: [
                {
                  model: VariationValue,
                  include: [VariationAttribute],
                },
              ],
            },
          ],
        },
      ],
    });

    // Transform variations to include attributes array and collect all images
    const transformed = products.map((product) => {
      const prod = product.toJSON();
      prod.ProductVariations = prod.ProductVariations.map((variation) => {
        // Group attributes by name
        const attrMap = {};
        (variation.VariationAttributeMaps || []).forEach((vam) => {
          const attrName = vam.VariationValue?.VariationAttribute?.name;
          const attrValue = vam.VariationValue?.value;
          if (attrName && attrValue) {
            if (!attrMap[attrName]) attrMap[attrName] = [];
            attrMap[attrName].push(attrValue);
          }
        });
        const attributes = Object.entries(attrMap).map(([name, values]) => ({
          name,
          value: values.join(", "),
        }));
        return {
          ...variation,
          attributes,
        };
      });
      // Collect all images from all variations
      prod.images = (prod.ProductVariations || []).flatMap(v => (v.ProductImages || []));
      return prod;
    });

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const identifier = req.params.name;
    const hyphenToSpace = identifier.replace(/-/g, ' ');

    // Try finding by slug first (SEO-friendly), then by exact name, then by name with hyphens converted to spaces
    let product = await Product.findOne({
      where: {
        [Op.or]: [
          { slug: identifier },
          { name: identifier },
          { name: hyphenToSpace },
        ],
      },
      include: [
        {
          model: Collection,
          attributes: ['id', 'name']
        },
        {
          model: ProductVariation,
          include: [
            { model: ProductImage, as: "ProductImages" },
            {
              model: VariationAttributeMap,
              include: [
                {
                  model: VariationValue,
                  include: [VariationAttribute],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Transform variations to include attributes array
    const prod = product.toJSON();
    prod.ProductVariations = prod.ProductVariations.map((variation) => {
      const attrMap = {};
      (variation.VariationAttributeMaps || []).forEach((vam) => {
        const attrName = vam.VariationValue?.VariationAttribute?.name;
        const attrValue = vam.VariationValue?.value;
        if (attrName && attrValue) {
          if (!attrMap[attrName]) attrMap[attrName] = [];
          attrMap[attrName].push(attrValue);
        }
      });
      const attributes = Object.entries(attrMap).map(([name, values]) => ({
        name,
        value: values.join(", "),
      }));
      return {
        ...variation,
        attributes,
      };
    });

    res.status(200).json({
      success: true,
      data: prod,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log("🔥 BACKEND FILE UPDATED - NEW VERSION RUNNING!");
    console.log("Update product request body:", req.body);
    console.log("Update product files:", req.files);

    // Extract data from FormData
    const name = req.body.name || '';
    const description = req.body.description || '';
    const collection_id = req.body.collection_id || req.body.id || ''; // Support both collection_id and id
    const slug = req.body.slug || '';
    const meta_title = req.body.meta_title || '';
    const meta_desc = req.body.meta_desc || '';
    const variations = req.body.variations;

    console.log("Extracted collection_id:", collection_id);
    console.log("All request body keys:", Object.keys(req.body));

    // Parse and validate id
    let parsedCollectionId;
    if (collection_id && collection_id !== "" && collection_id !== "undefined") {
      parsedCollectionId = parseInt(collection_id, 10);
      if (isNaN(parsedCollectionId) || parsedCollectionId <= 0) {
        return res.status(400).json({
          success: false,
          error: "Please select a valid collection. Collection ID must be a valid number."
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Please select a collection."
      });
    }

    // Validate collection exists
    const collection = await Collection.findByPk(parsedCollectionId);
    if (!collection) {
      return res.status(400).json({
        success: false,
        error: "Selected collection does not exist. Please select a valid collection."
      });
    }

    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariation,
          include: [
            {
              model: ProductImage,
              as: "ProductImages",
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Update basic product info
    await product.update({
      name: name ? name.trim() : product.name,
      description: description ? description.trim() : product.description,
      collection_id: parsedCollectionId, // <-- Use collection_id
      slug: slug ? slug.trim() : product.slug,
      meta_title: meta_title ? meta_title.trim() : product.meta_title,
      meta_desc: meta_desc ? meta_desc.trim() : product.meta_desc,
    });

    // Handle variations if provided
    if (variations) {
      let variationsData = [];
      try {
        variationsData = typeof variations === 'string' ? JSON.parse(variations) : variations;
      } catch (e) {
        console.error("Failed to parse variations:", e);
        return res.status(400).json({
          success: false,
          error: "Invalid variations data format."
        });
      }

      // Build a map of existingImages for each variation index
      console.log("🔍 BACKEND - Request body keys:", Object.keys(req.body));
      console.log("🔍 BACKEND - Files received:", req.files ? req.files.length : 0);
      console.log("🔒 BACKEND - SIMPLE APPROACH: Preserve ALL existing images automatically");
      
      // 🔍 DEBUG: Check what existing images frontend is sending
      const existingImageKeys = Object.keys(req.body).filter(key => key.startsWith('existingImages'));
      console.log("🔍 BACKEND - Frontend sent existing image keys:", existingImageKeys);
      existingImageKeys.forEach(key => {
        console.log(`   - ${key}: ${req.body[key]}`);
      });

      // 🚫 NEVER DELETE VARIATIONS - UPDATE THEM INSTEAD!
      console.log(`🔒 BACKEND - TRULY NON-DESTRUCTIVE: Update existing variations, preserve ALL images`);
      
      // Get current variations and their images (MUST include ProductImages)
      const currentVariations = await ProductVariation.findAll({
        where: { product_id: product.id },
        include: [{ model: ProductImage, as: "ProductImages" }]
      });
      console.log(`📊 BACKEND - Current variations: ${currentVariations.length}`);
      currentVariations.forEach((variation, index) => {
        console.log(`   - Variation ${index + 1}: SKU=${variation.sku}, Images=${variation.ProductImages?.length || 0}`);
        if (variation.ProductImages && variation.ProductImages.length > 0) {
          variation.ProductImages.forEach((img, imgIndex) => {
            console.log(`     - Image ${imgIndex + 1}: ID=${img.id}, URL=${img.image_url}`);
          });
        }
      });

      // Delete old variation attribute mappings only
      for (const variation of currentVariations) {
        await VariationAttributeMap.destroy({
          where: { variation_id: variation.id },
        });
      }

      // Update existing variations or create new ones (preserve ALL existing images)
      if (Array.isArray(variationsData) && variationsData.length > 0) {
        for (let i = 0; i < variationsData.length; i++) {
          const variation = variationsData[i];
          const { sku, price, usecase, attributes } = variation;

          // Validate required variation fields
          if (!sku || !sku.trim()) {
            throw new Error(`SKU is required for variation ${i + 1}`);
          }

          let productVariation;
          
          // Update existing variation or create new one
          if (currentVariations[i]) {
            // Update existing variation
            productVariation = currentVariations[i];
            await productVariation.update({
              sku: sku.trim(),
              price: price && !isNaN(parseFloat(price)) ? parseFloat(price) : null,
              usecase: usecase ? usecase.trim() : null,
            });
            console.log(`✅ BACKEND - Updated existing variation ${i + 1} (ID: ${productVariation.id})`);
          } else {
            // Create new variation if we have more variations than before
            productVariation = await ProductVariation.create({
              product_id: product.id,
              sku: sku.trim(),
              price: price && !isNaN(parseFloat(price)) ? parseFloat(price) : null,
              usecase: usecase ? usecase.trim() : null,
            });
            console.log(`✅ BACKEND - Created new variation ${i + 1} (ID: ${productVariation.id})`);
          }

          // 🔍 DEBUG: Check existing images for this variation
          const existingImageCount = await ProductImage.count({
            where: { variation_id: productVariation.id }
          });
          console.log(`📊 BACKEND - Variation ${i + 1} currently has ${existingImageCount} existing images`);
          
          // ✅ EXISTING IMAGES ARE AUTOMATICALLY PRESERVED (no deletion, just add new ones)

          // Handle new variation images
          const variationImageKey = `variation_images[${i}]`;
          const variationImages = req.files ? req.files.filter(file => file.fieldname === variationImageKey) : [];
          
          if (variationImages.length > 0) {
            const images = variationImages;

            for (let j = 0; j < images.length; j++) {
              const image = images[j];
              const isPrimary = j === 0; // First new image is primary

              try {
                // Compress the image
                const compressedFilename = await compressImage(image.path);
                console.log(`Compressed new image for variation ${i + 1}:`, compressedFilename);

                // Create image record
                const savedImage = await ProductImage.create({
                  variation_id: productVariation.id,
                  image_url: compressedFilename,
                  is_primary: isPrimary,
                });

                console.log(`Saved new image ${j + 1} for variation ${i + 1}:`, savedImage.id);
              } catch (imageError) {
                console.error(`Error processing new image ${j + 1} for variation ${i + 1}:`, imageError);
                throw new Error(`Failed to process new image ${j + 1} for variation ${i + 1}: ${imageError.message}`);
              }
            }
          }

          // Check total images for this variation
          const currentImageCount = await ProductImage.count({
            where: { variation_id: productVariation.id }
          });
          
          console.log(`📊 BACKEND - Variation ${i + 1} now has ${currentImageCount} total images (existing + new)`);
          
          if (currentImageCount === 0) {
            console.log(`Warning: No images for variation ${i + 1}. Images can be added later.`);
          }

          // Handle attributes
          if (attributes && Array.isArray(attributes)) {
            console.log(`Processing ${attributes.length} attributes for variation ${i + 1}`);
            for (const attr of attributes) {
              const { name: attrName, value: attrValue } = attr;

              if (attrName && attrName.trim() && attrValue && attrValue.trim()) {
                try {
                  // Find or create attribute
                  let [attribute] = await VariationAttribute.findOrCreate({
                    where: { name: attrName.trim() },
                    defaults: { name: attrName.trim() }
                  });

                  // Handle comma-separated values
                  const values = attrValue
                    .split(",")
                    .map((v) => v.trim())
                    .filter((v) => v);

                  for (const val of values) {
                    // Find or create value
                    let [attrValueRecord] = await VariationValue.findOrCreate({
                      where: {
                        variation_attr_id: attribute.id,
                        value: val,
                      },
                      defaults: {
                        variation_attr_id: attribute.id,
                        value: val,
                      }
                    });

                    // Create mapping
                    await VariationAttributeMap.create({
                      variation_id: productVariation.id,
                      variation_value_id: attrValueRecord.id,
                    });
                  }
                } catch (attrError) {
                  console.error(`Error processing attribute ${attrName}:`, attrError);
                  throw new Error(`Failed to process attribute ${attrName}: ${attrError.message}`);
                }
              }
            }
          }
        }
        
        // Handle excess variations (if user reduced the number of variations)
        if (currentVariations.length > variationsData.length) {
          const excessVariations = currentVariations.slice(variationsData.length);
          console.log(`🗑️ BACKEND - Removing ${excessVariations.length} excess variations`);
          
          for (const excessVariation of excessVariations) {
            // Delete images first (this will happen automatically due to foreign key)
            await ProductVariation.destroy({
              where: { id: excessVariation.id }
            });
            console.log(`🗑️ BACKEND - Deleted excess variation: ${excessVariation.sku}`);
          }
        }
      }
    }

    // Return updated product with variations
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Collection,
          attributes: ['id', 'name']
        },
        {
          model: ProductVariation,
          include: [
            {
              model: ProductImage,
              as: "ProductImages",
            },
            {
              model: VariationAttributeMap,
              include: [
                {
                  model: VariationValue,
                  include: [VariationAttribute],
                },
              ],
            },
          ],
        },
      ],
    });

    console.log("Product updated successfully:", updatedProduct.id);
    
    // 🔍 FINAL DEBUG: Log final image counts
    updatedProduct.ProductVariations.forEach((variation, index) => {
      console.log(`🔍 FINAL - Variation ${index + 1} (${variation.sku}): ${variation.ProductImages?.length || 0} images`);
    });

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log("Delete product request received for ID:", req.params.id);
    console.log("Request user:", req.user);
    
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariation,
          include: [
            {
              model: ProductImage,
              as: "ProductImages",
            },
          ],
        },
      ],
    });

    if (!product) {
      console.log("Product not found for ID:", req.params.id);
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    
    console.log("Found product:", product.name, "with", product.ProductVariations?.length || 0, "variations");

    // Delete all associated images first
    for (const variation of product.ProductVariations) {
      for (const image of variation.ProductImages) {
        // Delete the physical file only if image_url exists
        if (image.image_url) {
          try {
            const filePath = path.join(
              directories.products,
              image.image_url
            );
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted image file: ${image.image_url}`);
            }
          } catch (fileError) {
            console.error(`Error deleting image file ${image.image_url}:`, fileError);
            // Continue with deletion even if file deletion fails
          }
        }
        await image.destroy();
      }

      // Delete variation attribute mappings
      await VariationAttributeMap.destroy({
        where: { variation_id: variation.id },
      });
    }

    // Delete all variations
    await ProductVariation.destroy({
      where: { product_id: product.id },
    });

    // Finally delete the product
    await product.destroy();
    console.log("Product deleted successfully");

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Upload product image
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image",
      });
    }

    const { variation_id, is_primary } = req.body;

    if (!variation_id || isNaN(parseInt(variation_id))) {
      return res.status(400).json({
        success: false,
        error: "Valid variation ID is required",
      });
    }

    // Compress the image
    const compressedFilename = await compressImage(req.file.path);

    // Create image record
    const image = await ProductImage.create({
      variation_id: parseInt(variation_id),
      image_url: compressedFilename,
      is_primary: is_primary === "true" || is_primary === true,
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
  try {
    const image = await ProductImage.findByPk(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }

    // Delete the file only if image_url exists
            if (image.image_url) {
          try {
            const filePath = path.join(
              directories.products,
              image.image_url
            );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image file: ${image.image_url}`);
        }
      } catch (fileError) {
        console.error(`Error deleting image file ${image.image_url}:`, fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    await image.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get filter options for products
exports.getProductFilterOptions = async (req, res) => {
  try {
    // Get all products
    const products = await Product.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          value: product.name,
          label: product.name
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching product filter options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch filter options"
    });
  }
};