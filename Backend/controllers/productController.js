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
    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      collection_id: collection_id, // Use validated collection_id
      slug: slug.trim(),
      meta_title: meta_title ? meta_title.trim() : null,
      meta_desc: meta_desc ? meta_desc.trim() : null,
    });

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
          if (variationImages.length === 0) {
          throw new Error(`Each variation must have at least one image. Missing for variation ${i + 1}`);
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
    const product = await Product.findOne({
      where: { name: req.params.name },
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
      const existingImagesMap = {};
      Object.keys(req.body).forEach((key) => {
        const match = key.match(/^existingImages\[(\d+)\]\[\]$/);
        if (match) {
          const idx = match[1];
          if (!existingImagesMap[idx]) existingImagesMap[idx] = [];
          const val = req.body[key];
          if (Array.isArray(val)) {
            existingImagesMap[idx].push(...val);
          } else {
            existingImagesMap[idx].push(val);
          }
        }
      });

      console.log("Existing images map:", existingImagesMap);

      // Store existing images before deletion
      const existingImages = [];
      for (const variation of product.ProductVariations) {
        for (const image of variation.ProductImages) {
          existingImages.push({
            id: image.id,
            image_url: image.image_url,
            is_primary: image.is_primary,
            variation_index: product.ProductVariations.indexOf(variation)
          });
        }
      }

      // Delete old variation attribute mappings and variations
      for (const variation of product.ProductVariations) {
        await VariationAttributeMap.destroy({
          where: { variation_id: variation.id },
        });
      }

      // Delete old images that are not in keep list
      const allKeepImageIds = Object.values(existingImagesMap).flat();
      for (const variation of product.ProductVariations) {
        for (const image of variation.ProductImages) {
          if (!allKeepImageIds.includes(String(image.id)) && !allKeepImageIds.includes(image.image_url)) {
            const filePath = path.join(directories.products.compressed, image.image_url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            await image.destroy();
          }
        }
      }

      // Delete all existing variations
      await ProductVariation.destroy({
        where: { product_id: product.id },
      });

      // Create new variations
      if (Array.isArray(variationsData) && variationsData.length > 0) {
        for (let i = 0; i < variationsData.length; i++) {
          const variation = variationsData[i];
          const { sku, price, usecase, attributes } = variation;

          // Validate required variation fields
          if (!sku || !sku.trim()) {
            throw new Error(`SKU is required for variation ${i + 1}`);
          }

          // Create variation
          const productVariation = await ProductVariation.create({
            product_id: product.id,
            sku: sku.trim(),
            price: price && !isNaN(parseFloat(price)) ? parseFloat(price) : null,
            usecase: usecase ? usecase.trim() : null,
          });

          console.log(`Created variation ${i + 1} with ID:`, productVariation.id);

          // Restore kept images for this variation
          const keepImages = existingImagesMap[i] || [];
          const imagesToRestore = existingImages.filter(img => 
            keepImages.includes(String(img.id)) || keepImages.includes(img.image_url)
          );

          for (const imageToRestore of imagesToRestore) {
            await ProductImage.create({
              variation_id: productVariation.id,
              image_url: imageToRestore.image_url,
              is_primary: imageToRestore.is_primary,
            });
            console.log(`Restored image for variation ${i + 1}:`, imageToRestore.image_url);
          }

          // Handle new variation images
          const variationImageKey = `variation_images[${i}]`;
          if (req.files && req.files[variationImageKey]) {
            const images = Array.isArray(req.files[variationImageKey])
              ? req.files[variationImageKey]
              : [req.files[variationImageKey]];

            for (let j = 0; j < images.length; j++) {
              const image = images[j];
              const isPrimary = j === 0 && imagesToRestore.length === 0; // First new image is primary if no kept images

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

          // Validate that variation has at least one image
          const totalImages = imagesToRestore.length + (req.files && req.files[variationImageKey] ? 
            (Array.isArray(req.files[variationImageKey]) ? req.files[variationImageKey].length : 1) : 0);
          
          if (totalImages === 0) {
            throw new Error(`Each variation must have at least one image. Missing for variation ${i + 1}`);
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

    // Delete all associated images first
    for (const variation of product.ProductVariations) {
      for (const image of variation.ProductImages) {
        // Delete the physical file
        const filePath = path.join(
          directories.products.compressed,
          image.image_url
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
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

    // Delete the file
    const filePath = path.join(
      directories.products.compressed,
      image.image_url
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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