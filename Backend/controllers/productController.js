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

    const {
      name,
      description,
      collection_id,
      slug,
      meta_title,
      meta_desc,
      variations,
    } = req.body;

    // Validate collection_id exists
    const collection = await Collection.findByPk(Number(collection_id));
    if (!collection) {
      return res.status(400).json({
        success: false,
        error: "Selected collection does not exist. Please select a valid collection."
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      collection_id,
      slug,
      meta_title,
      meta_desc,
    });

    // Handle variations if provided
    let variationsData;
    try {
      variationsData = JSON.parse(variations);
    } catch (e) {
      variationsData = variations; // If it's already an object
    }

    if (Array.isArray(variationsData)) {
      for (let i = 0; i < variationsData.length; i++) {
        const variation = variationsData[i];
        const { sku, price, usecase, attributes } = variation;

        // Require at least one image per variation
        if (!req.files || !req.files[`variation_images[${i}]`] || (Array.isArray(req.files[`variation_images[${i}]`]) && req.files[`variation_images[${i}]`].length === 0)) {
          throw new Error(`Each variation must have at least one image. Missing for variation ${i + 1}`);
        }

        // Create variation
        const productVariation = await ProductVariation.create({
          product_id: product.id,
          sku,
          price,
          usecase,
        });

        // Handle variation images
        if (req.files && req.files[`variation_images[${i}]`]) {
          const images = Array.isArray(req.files[`variation_images[${i}]`])
            ? req.files[`variation_images[${i}]`]
            : [req.files[`variation_images[${i}]`]];

          for (let j = 0; j < images.length; j++) {
            const image = images[j];
            const isPrimary = j === 0; // First image is primary

            // Compress the image
            const compressedFilename = await compressImage(image.path);

            // Create image record
            await ProductImage.create({
              variation_id: productVariation.id,
              image_url: compressedFilename,
              is_primary: isPrimary,
            });
          }
        }

        // Handle attributes
        if (attributes && Array.isArray(attributes)) {
          for (const attr of attributes) {
            const { name, value } = attr;

            if (name && value) {
              // Find or create attribute
              let [attribute] = await VariationAttribute.findOrCreate({
                where: { name },
              });

              // Handle comma-separated values
              const values = value
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v);

              for (const val of values) {
                // Find or create value
                let [attrValue] = await VariationValue.findOrCreate({
                  where: {
                    variation_attr_id: attribute.id,
                    value: val,
                  },
                });

                // Create mapping
                await VariationAttributeMap.create({
                  variation_id: productVariation.id,
                  variation_value_id: attrValue.id,
                });
              }
            }
          }
        }
      }
    }

    // Return created product with variations and images
    const createdProduct = await Product.findByPk(product.id, {
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
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      collection_id,
      slug,
      meta_title,
      meta_desc,
      variations,
    } = req.body;

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
      name,
      description,
      collection_id,
      slug,
      meta_title,
      meta_desc,
    });

    // Handle variations if provided
    if (variations) {
      // Parse variations and prepare existingImages map
      let variationsData;
      try {
        variationsData = JSON.parse(variations);
      } catch (e) {
        variationsData = variations; // If it's already an object
      }
      // Build a map of existingImages for each variation index
      const existingImagesMap = {};
      if (req.body && req.body['existingImages[0][]']) {
        // Handle single or multiple existingImages fields
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
      }

      // First, delete existing variations and their data
      for (const variation of product.ProductVariations) {
        // Delete variation images not in the keep list
        const keepImageIdsOrUrls = Object.values(existingImagesMap).flat();
        for (const image of variation.ProductImages) {
          // Keep by id or image_url
          if (
            !keepImageIdsOrUrls.includes(String(image.id)) &&
            !keepImageIdsOrUrls.includes(image.image_url)
          ) {
            const filePath = path.join(
              directories.products.compressed,
              image.image_url
            );
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            await image.destroy();
          }
        }
        // Delete variation attribute mappings
        await VariationAttributeMap.destroy({
          where: { variation_id: variation.id },
        });
      }

      // Delete all existing variations
      await ProductVariation.destroy({
        where: { product_id: product.id },
      });

      // Create new variations
      if (Array.isArray(variationsData)) {
        for (let i = 0; i < variationsData.length; i++) {
          const variation = variationsData[i];
          const { sku, price, usecase, attributes } = variation;

          // Create variation
          const productVariation = await ProductVariation.create({
            product_id: product.id,
            sku,
            price,
            usecase,
          });

          // Restore kept images for this variation
          const keepImages = existingImagesMap[i] || [];
          if (keepImages.length > 0 && product.ProductVariations[i]) {
            for (const image of product.ProductVariations[i].ProductImages) {
              if (
                keepImages.includes(String(image.id)) ||
                keepImages.includes(image.image_url)
              ) {
                // Re-create the image for the new variation
                await ProductImage.create({
                  variation_id: productVariation.id,
                  image_url: image.image_url,
                  is_primary: image.is_primary,
                });
              }
            }
          }

          // Handle variation images (new uploads)
          if (req.files && req.files[`variation_images[${i}]`]) {
            const images = Array.isArray(req.files[`variation_images[${i}]`])
              ? req.files[`variation_images[${i}]`]
              : [req.files[`variation_images[${i}]`]];

            for (let j = 0; j < images.length; j++) {
              const image = images[j];
              const isPrimary = j === 0 && keepImages.length === 0; // First image is primary if no kept images

              // Compress the image
              const compressedFilename = await compressImage(image.path);

              // Create image record
              await ProductImage.create({
                variation_id: productVariation.id,
                image_url: compressedFilename,
                is_primary: isPrimary,
              });
            }
          }

          // Handle attributes
          if (attributes && Array.isArray(attributes)) {
            for (const attr of attributes) {
              const { name, value } = attr;

              if (name && value) {
                // Find or create attribute
                let [attribute] = await VariationAttribute.findOrCreate({
                  where: { name },
                });

                // Handle comma-separated values
                const values = value
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);

                for (const val of values) {
                  // Find or create value
                  let [attrValue] = await VariationValue.findOrCreate({
                    where: {
                      variation_attr_id: attribute.id,
                      value: val,
                    },
                  });

                  // Create mapping
                  await VariationAttributeMap.create({
                    variation_id: productVariation.id,
                    variation_value_id: attrValue.id,
                  });
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

    // Compress the image
    const compressedFilename = await compressImage(req.file.path);

    // Create image record
    const image = await ProductImage.create({
      variation_id,
      image_url: compressedFilename,
      is_primary: is_primary === "true",
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
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
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
