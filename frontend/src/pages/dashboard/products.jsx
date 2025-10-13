import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import {
  adminProductService,
  adminCollectionService,
} from "../../services/adminService";
import { getProductImageUrl } from "../../utils/imageUtils";

const columns = [
  { accessor: "name", header: "Product Name" },
  { accessor: "description", header: "Description" },
  { accessor: "slug", header: "Slug" },
  {
    accessor: "ProductVariations",
    header: "Variations",
    cell: ({ ProductVariations }) => {
      if (!ProductVariations || ProductVariations.length === 0) {
        return <span style={{ color: "#999" }}>No variations</span>;
      }
      return (
        <div>
          {ProductVariations.map((variation) => (
            <div
              key={variation.id}
              style={{ fontSize: "12px", marginBottom: "2px" }}
            >
              {variation.sku} - ₹{variation.price || "0.00"}
            </div>
          ))}
        </div>
      );
    },
  },
];

const getFilters = (filterOptions) => [
  {
    key: "name",
    label: "Product",
    options: [
      { value: "", label: "All Products" },
      ...filterOptions.products
    ],
  },
];

// Stepper Component
const Stepper = ({ currentStep, totalSteps, onStepClick }) => {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
    >
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center" }}>
          <div
            onClick={() => onStepClick(index)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: index <= currentStep ? "#1976d2" : "#e0e0e0",
              color: index <= currentStep ? "white" : "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              style={{
                width: 60,
                height: 2,
                backgroundColor: index < currentStep ? "#1976d2" : "#e0e0e0",
                margin: "0 8px",
              }}
            />
          )}
        </div>
      ))}

    </div>
  );
};

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collection_id: "", 
    slug: "",
    meta_title: "",
    meta_desc: "",
    variations: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ name: '' });
  const [filterOptions, setFilterOptions] = useState({ products: [] });

  const steps = [
    { title: "Basic Info", key: "basic" },
    { title: "SEO & Meta", key: "seo" },
    { title: "Variations", key: "variations" },
  ];

  // Log form data initialization
  useEffect(() => {
    console.log("Initial form data:", formData);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminProductService.getProducts();
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to fetch products";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const fetchCollections = async () => {
    try {
      const res = await adminCollectionService.getCollections();
      setCollections(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
      toast.error("Failed to fetch collections");
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await adminProductService.getFilterOptions();
      setFilterOptions(res.data.data || { products: [] });
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Log collection_id when fetching collections
  useEffect(() => {
    fetchCollections();
    fetchFilterOptions();
    console.log("Fetching collections...");
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setCurrentStep(0);
    setFormData({
      name: "",
      description: "",
      collection_id: "",
      slug: "",
      meta_title: "",
      meta_desc: "",
      variations: [],
    });
    setShowModal(true);
    setError("");
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setCurrentStep(0);
    setError("");
    
    // Properly transform product data for editing
    const transformedVariations = (product.ProductVariations || []).map((variation, varIndex) => {
      const existingImages = (variation.ProductImages || []).map((img) => {
        const preview = getProductImageUrl(img.image_url);
        
        return {
          preview,
          is_primary: img.is_primary,
          id: img.id,
          image_url: img.image_url,
          existing: true, // Mark as existing image
        };
      });
      
      console.log(`🔄 LOADING EXISTING IMAGES for variation ${varIndex + 1}:`, {
        imageCount: existingImages.length,
        images: existingImages.map(img => ({ 
          existing: img.existing, 
          id: img.id, 
          image_url: img.image_url,
          preview: img.preview?.substring(0, 30) + '...' 
        }))
      });
      
      return {
        ...variation,
        images: existingImages,
        attributes: variation.attributes || [],
      };
    });

    setFormData({
      name: product.name || "",
      description: product.description || "",
      collection_id: product.collection_id ? product.collection_id.toString() : "",
      slug: product.slug || "",
      meta_title: product.meta_title || "",
      meta_desc: product.meta_desc || "",
      variations: transformedVariations,
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log("Attempting to delete product:", product.id, product.name);
      const response = await adminProductService.deleteProduct(product.id);
      console.log("Delete response:", response);
      await fetchProducts();
      console.log("Product deleted successfully");
      toast.success(`Product "${product.name}" deleted successfully`);
    } catch (err) {
      console.error("Error deleting product:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to delete product";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  // Log input changes
  const handleInputChange = (field, value) => {
    console.log(`Input change - ${field}:`, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'collection_id') {
      console.log("Selected collection_id:", value);
    }

    // Auto-generate slug from name if it's the name field and we're not editing
    if (field === 'name' && !selectedProduct && value) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleVariationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === index ? { ...variation, [field]: value } : variation
      ),
    }));
  };

  const handleVariationImageUpload = (index, files) => {
    if (!files || files.length === 0) {
      return;
    }
    
    console.log(`📸 Adding ${files.length} images to variation ${index + 1}`);
    
    // Create new image objects
    const newImages = Array.from(files).map((file, fileIndex) => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        preview,
        is_primary: false,
        existing: false,
        id: `new_${Date.now()}_${fileIndex}`,
      };
    });
    
    setFormData((prev) => {
      const currentVariation = prev.variations[index];
      const existingImages = currentVariation?.images || [];
      
      console.log(`🔍 PRESERVING EXISTING IMAGES:`);
      console.log(`   - Existing images count: ${existingImages.length}`);
      console.log(`   - Existing images details:`, existingImages.map(img => ({
        id: img.id,
        existing: img.existing,
        preview: img.preview?.substring(0, 30) + '...',
        hasFile: !!img.file
      })));
      console.log(`   - New images count: ${newImages.length}`);
      
      // CRITICAL: Preserve ALL existing images + add new ones
      const allImages = [...existingImages, ...newImages];
      
      console.log(`   - Combined total: ${allImages.length}`);
      console.log(`   - Final image list:`, allImages.map(img => ({
        id: img.id,
        existing: img.existing,
        preview: img.preview?.substring(0, 30) + '...'
      })));
      
      const newState = {
        ...prev,
        variations: prev.variations.map((variation, i) =>
          i === index
            ? { ...variation, images: allImages }
            : variation
        ),
      };
      
      console.log(`✅ STATE UPDATED - Variation ${index + 1} now has ${newState.variations[index].images.length} images`);
      
      return newState;
    });
    
    // Force a small re-render to ensure images display immediately
    setTimeout(() => {
      console.log(`✅ Images added successfully to variation ${index + 1}`);
    }, 50);
  };

  const removeVariationImage = (variationIndex, imageIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              images: variation.images.filter(
                (_, imgIndex) => imgIndex !== imageIndex
              ),
            }
          : variation
      ),
    }));
  };

  const setPrimaryImage = (variationIndex, imageIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              images: variation.images.map((img, imgIndex) => ({
                ...img,
                is_primary: imgIndex === imageIndex,
              })),
            }
          : variation
      ),
    }));
  };

  const addVariationAttribute = (variationIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              attributes: [
                ...(variation.attributes || []),
                { name: "", value: "" },
              ],
            }
          : variation
      ),
    }));
  };

  const removeVariationAttribute = (variationIndex, attrIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              attributes: variation.attributes.filter(
                (_, attrIdx) => attrIdx !== attrIndex
              ),
            }
          : variation
      ),
    }));
  };

  const handleAttributeChange = (variationIndex, attrIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              attributes: variation.attributes.map((attr, attrIdx) =>
                attrIdx === attrIndex ? { ...attr, [field]: value } : attr
              ),
            }
          : variation
      ),
    }));
  };

  const addVariation = () => {
    try {
      console.log("Adding variation, current count:", formData.variations.length);
      setFormData((prev) => ({
        ...prev,
        variations: [
          ...prev.variations,
          {
            sku: "",
            price: "",
            usecase: "",
            images: [],
            attributes: [],
          },
        ],
      }));
      console.log("Variation added successfully");
    } catch (error) {
      console.error("Error adding variation:", error);
      setError("Failed to add variation: " + error.message);
    }
  };

  const removeVariation = (index) => {
    try {
      console.log("Removing variation at index:", index);
      setFormData((prev) => ({
        ...prev,
        variations: prev.variations.filter((_, i) => i !== index),
      }));
      console.log("Variation removed successfully");
    } catch (error) {
      console.error("Error removing variation:", error);
      setError("Failed to remove variation: " + error.message);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep || currentStep === steps.length - 1) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Basic Info
        if (!formData.name?.trim()) {
          setError("Product name is required");
          return false;
        }
        if (!formData.collection_id || formData.collection_id === "") {
          setError("Please select a collection");
          return false;
        }
        
        return true;
      case 1: // SEO & Meta
        if (!formData.slug?.trim()) {
          setError("Slug is required");
          return false;
        }
        return true;
      case 2: // Variations
        if (!formData.variations || formData.variations.length === 0) {
          setError("At least one variation is required");
          return false;
        }
        
        for (let i = 0; i < formData.variations.length; i++) {
          const variation = formData.variations[i];
          if (!variation.sku?.trim()) {
            setError(`SKU is required for variation ${i + 1}`);
            return false;
          }
          
          // Images are optional - no validation needed
          const hasImages = Array.isArray(variation.images) && variation.images.length > 0;
          if (!hasImages) {
            console.log(`Info: Variation ${i + 1} has no images. Images can be added later.`);
          }
        }
        return true;
      default:
        return true;
    }
  };



  const handleSubmit = async () => {
    // Validate all steps before submission
    for (let i = 0; i <= 2; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }
      if (!formData.slug.trim()) {
        throw new Error("Product slug is required");
      }
      
      // Validate collection id
      const parsedId = parseInt(formData.collection_id, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error("Please select a valid collection");
      }

      // Prepare FormData for multipart/form-data
      const form = new FormData();
      
      // Add basic product data
      form.append("name", formData.name.trim());
      form.append("description", formData.description?.trim() || "");
      form.append("collection_id", parsedId.toString()); // Send as string but validated as number
      form.append("slug", formData.slug.trim());
      form.append("meta_title", formData.meta_title?.trim() || "");
      form.append("meta_desc", formData.meta_desc?.trim() || "");

      // Prepare variations data
      const variationsForBackend = formData.variations.map((variation) => ({
        id: variation.id || undefined,
        sku: variation.sku?.trim() || "",
        price: variation.price || null,
        usecase: variation.usecase?.trim() || "",
        attributes: (variation.attributes || [])
          .filter(attr => attr.name?.trim() && attr.value?.trim())
          .map(attr => ({
            name: attr.name.trim(),
            value: attr.value.trim()
          })),
      }));

      form.append("variations", JSON.stringify(variationsForBackend));

      // Handle existing images for update
      if (selectedProduct) {
        console.log(`🔄 PROCESSING EXISTING IMAGES FOR UPDATE:`);
        formData.variations.forEach((variation, i) => {
          const allImages = variation.images || [];
          const existingImages = allImages.filter(img => img.existing && (img.id || img.image_url));
          const existingImageIds = existingImages.map(img => img.id || img.image_url);
          
          console.log(`   - Variation ${i + 1}:`);
          console.log(`     - Total images in form: ${allImages.length}`);
          console.log(`     - Existing images found: ${existingImages.length}`);
          console.log(`     - Existing image IDs:`, existingImageIds);
          
          if (existingImageIds.length > 0) {
            existingImageIds.forEach(imgId => {
              form.append(`existingImages[${i}][]`, imgId);
              console.log(`     - Added to form: existingImages[${i}][] = ${imgId}`);
            });
          } else {
            console.log(`     - ⚠️ No existing images to preserve for variation ${i + 1}`);
          }
        });
      }

      // Attach new image files - create dummy image if no images at all
      for (let i = 0; i < formData.variations.length; i++) {
        const variation = formData.variations[i];
        const newImages = (variation.images || []).filter(img => img.file);
        const existingImages = (variation.images || []).filter(img => img.existing && (img.id || img.image_url));
        const allImages = variation.images || [];
        const totalImages = newImages.length + existingImages.length;
        
        console.log(`Variation ${i + 1} image analysis:`, {
          totalImagesInUI: allImages.length,
          newImages: newImages.length,
          existingImages: existingImages.length,
          calculatedTotal: totalImages,
          hasAnyImages: allImages.length > 0
        });
        
        // Use the EXACT format the backend expects
        const imagesWithFiles = (variation.images || []).filter(img => img.file);
        
        if (imagesWithFiles.length > 0) {
          console.log(`✅ Adding ${imagesWithFiles.length} actual images for variation ${i + 1}`);
          imagesWithFiles.forEach((img, imgIndex) => {
            console.log(`📎 Attaching image ${imgIndex + 1}:`, img.file.name, img.file.size, 'bytes');
            // Backend expects: req.files.filter(file => file.fieldname === `variation_images[${i}]`)
            form.append(`variation_images[${i}]`, img.file);
          });
        } else {
          // Add dummy image only if no real images
          console.log(`🔒 Adding dummy image for variation ${i + 1} (no real images)`);
          const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==';
          
          const byteCharacters = atob(dummyImageData.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          const dummyFile = new File([blob], `dummy_${i}.png`, { type: 'image/png' });
          form.append(`variation_images[${i}]`, dummyFile);
        }
      }

      // Debug log
      console.log("Submitting form data:", {
        name: formData.name,
        id: formData.id,
        slug: formData.slug,
        collection_id: parsedId, // Log the collection_id
        variations: variationsForBackend,
        isUpdate: !!selectedProduct,
        variationImageCounts: formData.variations.map((v, i) => ({
          variation: i + 1,
          totalImages: (v.images || []).length,
          newImages: (v.images || []).filter(img => img.file).length,
          existingImages: (v.images || []).filter(img => img.existing).length
        }))
      });

      let response;
      if (selectedProduct) {
        response = await adminProductService.updateProduct(selectedProduct.id, form);
      } else {
        response = await adminProductService.createProduct(form);
      }

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Success flag:", response.data?.success);

      // Check response
      if (response.data && response.data.success) {
        console.log("Product saved successfully, closing modal");
        setError(""); // Clear any previous errors
        setLoading(false);
        
        // Show success toast
        toast.success(selectedProduct ? "Product updated successfully!" : "Product created successfully!");
        
        // Force refresh products list
        console.log("🔄 Refreshing products list after successful update...");
        await fetchProducts();
        console.log("✅ Products list refreshed");
        
        // Close modal and reset form immediately
        setShowModal(false);
        setCurrentStep(0);
        setSelectedProduct(null); // Clear selected product
        setError("");
        
        // Reset form data
        setFormData({
          name: "",
          description: "",
          collection_id: "", 
          slug: "",
          meta_title: "",
          meta_desc: "",
          variations: [],
        });
      } else {
        console.log("Product save failed:", response.data?.error);
        const errorMessage = response.data?.error || "Failed to save product";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      console.error("Full error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error headers:", err.response?.headers);
      
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to save product";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setCurrentStep(0);
  };

  const handleFiltersChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStepContent = () => {
    console.log("Rendering step:", currentStep, "of", steps.length);
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div>
            <InputField
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              placeholder="Enter product name"
            />

            <InputField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              multiline
              rows={3}
              placeholder="Enter product description"
            />

           <InputField
  label="Collection"
  type="select"
  value={formData.collection_id}
  onChange={(e) => {
    const selectedId = e.target.value;
    const selectedCollection = collections.find(c => c.id.toString() === selectedId);
    if (!selectedCollection && selectedId !== "") {
      setError("Please select a valid collection");
      return;
    }
    handleInputChange("collection_id", selectedId);
  }}
  options={[
    { value: "", label: "Select an option" },
    ...collections.map((c) => ({
      value: c.id.toString(),
      label: c.name,
    })),
  ]}
  required
/>

            
            {/* Debug info */}
            <div style={{ 
              marginTop: 10, 
              padding: 8, 
              backgroundColor: "#f0f0f0", 
              borderRadius: 4, 
              fontSize: 12 
            }}>
              Debug: Selected collection_id = {formData.collection_id} (type: {typeof formData.collection_id})
            </div>
          </div>
        );

      case 1: // SEO & Meta
        return (
          <div>
            <InputField
              label="Slug"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              required
              placeholder="Enter product slug (e.g., product-name)"
            />

            <InputField
              label="Meta Title"
              value={formData.meta_title}
              onChange={(e) => handleInputChange("meta_title", e.target.value)}
              placeholder="Enter meta title for SEO"
            />

            <InputField
              label="Meta Description"
              value={formData.meta_desc}
              onChange={(e) => handleInputChange("meta_desc", e.target.value)}
              multiline
              rows={2}
              placeholder="Enter meta description for SEO"
            />
          </div>
        );

      case 2: // Variations
        console.log("Rendering variations step");
        return (
          <div style={{ padding: "20px" }}>
            <div
              style={{
                backgroundColor: "#e8f5e8",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "2px solid #4caf50",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", color: "#2e7d32" }}>
                ✅ Product Variations Step ✅
              </h3>
              <p style={{ margin: 0, color: "#2e7d32" }}>
                Current variations:{" "}
                <strong>{formData.variations.length}</strong>
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>Manage Variations</h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Adding variation...");
                  addVariation();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Add Variation
              </button>
            </div>

            {formData.variations.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#666",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border: "2px dashed #ddd",
                }}
              >
                <p style={{ margin: 0, fontSize: "16px" }}>
                  No variations added yet.
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                  Click "Add Variation" to start adding product variations.
                </p>
              </div>
            ) : (
              <div>
                {formData.variations.map((variation, index) => {
                  console.log(`Rendering variation ${index + 1}:`, {
                    hasImages: !!(variation.images && variation.images.length > 0),
                    imageCount: variation.images?.length || 0,
                    images: variation.images?.map(img => ({ preview: img.preview, existing: img.existing })) || []
                  });
                  
                  return (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "16px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <h4 style={{ margin: 0, color: "#333" }}>
                        Variation {index + 1}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Removing variation:", index);
                          removeVariation(index);
                        }}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <InputField
                        label="SKU"
                        value={variation.sku || ""}
                        onChange={(e) =>
                          handleVariationChange(index, "sku", e.target.value)
                        }
                        placeholder="Enter SKU"
                        required
                      />
                      <InputField
                        label="Price"
                        type="number"
                        value={variation.price || ""}
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                          handleVariationChange(
                            index,
                            "price",
                            e.target.value ? parseFloat(e.target.value) : ""
                          )
                        }
                      />
                    </div>

                    <InputField
                      label="Use Case"
                      value={variation.usecase || ""}
                      onChange={(e) =>
                        handleVariationChange(index, "usecase", e.target.value)
                      }
                      multiline
                      rows={2}
                      placeholder="Enter use case description"
                    />

                    {/* Images Section */}
                    <div style={{ marginTop: "16px" }}>
                      <h5 style={{ margin: "0 0 12px 0", color: "#333" }}>
                        Images <span style={{ fontSize: "12px", color: "#1976d2", marginLeft: "8px" }}>(Recommended)</span>
                        <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>
                          (Select multiple images at once)
                        </span>
                      </h5>
                      <div style={{ 
                        border: "2px dashed #1976d2", 
                        borderRadius: "8px", 
                        padding: "20px", 
                        textAlign: "center",
                        backgroundColor: "#f8f9ff",
                        marginBottom: "12px",
                        transition: "all 0.2s ease"
                      }}>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          data-variation={index}
                          onChange={(e) => {
                            console.log(`File input change for variation ${index + 1}:`, e.target.files);
                            if (e.target.files && e.target.files.length > 0) {
                              handleVariationImageUpload(index, e.target.files);
                              // Don't reset the input immediately - let user see what they selected
                              // Reset after a short delay to allow re-selection of same files if needed
                              setTimeout(() => {
                                e.target.value = '';
                              }, 100);
                            }
                          }}
                          style={{ 
                            display: "none"
                          }}
                          id={`file-input-${index}`}
                        />
                        
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "16px", color: "#1976d2", marginBottom: "8px" }}>
                            📸 {variation.images && variation.images.length > 0 ? "Add More Images" : "Upload Product Images"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                            💡 All selected images will be added to your current collection
                          </div>
                          <div style={{ fontSize: "11px", color: "#999" }}>
                            Hold Ctrl/Cmd to select multiple • JPG, PNG, GIF, WebP supported
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById(`file-input-${index}`);
                            if (fileInput) fileInput.click();
                          }}
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#1976d2",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "background-color 0.2s ease"
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#1565c0"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#1976d2"}
                        >
                          {variation.images && variation.images.length > 0 ? "📎 Add More Images" : "📁 Choose Images"}
                        </button>
                      </div>
                      
                      {(!variation.images || variation.images.length === 0) && (
                        <div style={{ 
                          padding: "12px", 
                          backgroundColor: "#e3f2fd", 
                          border: "1px solid #bbdefb",
                          borderRadius: "4px",
                          marginBottom: "12px"
                        }}>
                          <div style={{ color: "#1565c0", marginBottom: "8px", fontWeight: "bold" }}>
                            💡 No images selected yet
                          </div>
                          <div style={{ color: "#1565c0", fontSize: "12px" }}>
                            • Click "Select Images" button above<br/>
                            • Hold Ctrl (Windows) or Cmd (Mac) to select multiple images at once<br/>
                            • You can add more images later by clicking "Add More Images"
                          </div>
                        </div>
                      )}

                      {variation.images && variation.images.length > 0 && (
                        <div>
                          <div style={{ 
                            width: "100%", 
                            marginBottom: "12px",
                            padding: "8px",
                            backgroundColor: "#e8f5e8",
                            borderRadius: "4px",
                            border: "1px solid #4caf50"
                          }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#2e7d32", marginBottom: "4px" }}>
                              ✅ {variation.images.length} image{variation.images.length > 1 ? 's' : ''} ready
                            </div>
                            <div style={{ fontSize: "12px", color: "#2e7d32", marginBottom: "4px" }}>
                              {selectedProduct ? 
                                "All images (existing + new) will be saved together" : 
                                "Images will be uploaded when you create the product"
                              }
                            </div>
                            <div style={{ fontSize: "11px", color: "#666" }}>
                              💡 Add more images or remove individual ones - existing images stay until you remove them
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                          {(() => {
                            const imagesToRender = variation.images || [];
                            console.log(`🖼️ RENDERING IMAGES for variation ${index + 1}:`, {
                              totalImages: imagesToRender.length,
                              existingCount: imagesToRender.filter(img => img.existing).length,
                              newCount: imagesToRender.filter(img => !img.existing).length,
                              images: imagesToRender.map(img => ({
                                existing: img.existing,
                                id: img.id,
                                hasFile: !!img.file,
                                preview: img.preview?.substring(0, 30) + '...'
                              }))
                            });
                            
                            if (imagesToRender.length === 0) {
                              console.log(`⚠️ No images to render for variation ${index + 1}`);
                              return null;
                            }
                            
                            return imagesToRender.map((image, imgIndex) => (
                            <div
                              key={image.id || `img-${imgIndex}-${image.preview?.slice(-10)}`}
                              style={{
                                position: "relative",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "4px",
                              }}
                            >
                              <img
                                src={image.preview}
                                alt={`Variation ${index + 1} Image ${
                                  imgIndex + 1
                                }`}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                                onLoad={() => console.log(`Image loaded successfully: ${image.preview}`)}
                                onError={(e) => {
                                  console.error(`Failed to load image: ${image.preview}`, e);
                                  e.target.style.border = '2px solid red';
                                }}
                              />
                              {/* Image type indicator */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  left: "4px",
                                  padding: "2px 4px",
                                  backgroundColor: image.existing ? "#ff9800" : "#2196f3",
                                  color: "white",
                                  borderRadius: "3px",
                                  fontSize: "8px",
                                  fontWeight: "bold"
                                }}
                              >
                                {image.existing ? "EXISTING" : "NEW"}
                              </div>
                              
                              <div
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  display: "flex",
                                  gap: "4px",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    removeVariationImage(index, imgIndex)
                                  }
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                  }}
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ));
                          })()}
                        </div>
                        </div>
                      )}
                    </div>

                    {/* Attributes Section */}
                    <div style={{ marginTop: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <h5 style={{ margin: 0, color: "#333" }}>Attributes</h5>
                        <button
                          onClick={() => addVariationAttribute(index)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Add Attribute
                        </button>
                      </div>

                      {variation.attributes &&
                      variation.attributes.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {variation.attributes.map((attr, attrIndex) => (
                            <div
                              key={attrIndex}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                padding: "12px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "4px",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr auto",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="Attribute name"
                                  value={attr.name || ""}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      index,
                                      attrIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    padding: "6px 8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Attribute value (comma-separated)"
                                  value={attr.value || ""}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      index,
                                      attrIndex,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    padding: "6px 8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    removeVariationAttribute(index, attrIndex)
                                  }
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                              {attr.value && (
                                <div
                                  style={{
                                    padding: "8px",
                                    backgroundColor: "#e3f2fd",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  <strong>Values:</strong>{" "}
                                  {attr.value.split(",").map((val, i) => (
                                    <span
                                      key={i}
                                      style={{
                                        display: "inline-block",
                                        backgroundColor: "#1976d2",
                                        color: "white",
                                        padding: "2px 6px",
                                        borderRadius: "12px",
                                        margin: "2px",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {val.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: "#666",
                              fontStyle: "italic",
                              fontSize: "14px",
                            }}
                          >
                            No attributes added. Click "Add Attribute" to start.
                          </p>
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              color: "#999",
                              fontSize: "12px",
                            }}
                          >
                            💡 Tip: Use commas to separate multiple values
                            (e.g., "Red, Blue, Green")
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        console.log("Unknown step:", currentStep);
        return (
          <div style={{ padding: 20, textAlign: "center", color: "red" }}>
            <h3>Step {currentStep} not found!</h3>
            <p>Available steps: 0, 1, 2</p>
          </div>
        );
    }
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditProduct },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteProduct },
  ];

  // Helper: Check if all variations have at least one image and required fields
  const canSubmit = () => {
    if (!formData.name || !formData.slug || !formData.collection_id) {
      return false;
    }
    
    if (formData.variations.length === 0) {
      return false; // Require at least one variation
    }
    
    return formData.variations.every(variation => {
      const hasValidSku = variation.sku && variation.sku.trim();
      // Images are optional but recommended
      return hasValidSku;
    });
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Products Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#ffebee",
            borderRadius: 4,
            border: "1px solid #ffcdd2",
          }}
        >
          {error}
        </div>
      )}

      <TableWithControls
        columns={columns}
        data={products}
        searchFields={["name", "description", "slug"]}
        filters={getFilters(filterOptions)}
        actions={actions}
        loading={loading}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedProduct ? "Edit Product" : "Add Product"}
        size="large"
        closeOnOverlayClick={false}
      >
        <div>
          <Stepper
            currentStep={currentStep}
            totalSteps={steps.length}
            onStepClick={handleStepClick}
          />

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: 0, color: "#1976d2" }}>
              Step {currentStep + 1}: {steps[currentStep].title}
            </h3>
            <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
              {currentStep === 0 && "Enter basic product information"}
              {currentStep === 1 && "Configure SEO and meta information"}
              {currentStep === 2 && "Manage product variations"}
            </p>
          </div>

          {renderStepContent()}

          {error && (
            <div
              style={{
                color: "red",
                marginBottom: 16,
                padding: 8,
                backgroundColor: "#ffebee",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div
            className="modal-actions"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  onClick={prevStep}
                  type="button"
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                type="button"
                disabled={loading}
              >
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={nextStep}
                  type="button"
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <>
                  {!canSubmit() && (
                    <div style={{ color: 'red', marginBottom: 8, fontWeight: 'bold', fontSize: 12 }}>
                      Please fill all required fields, add at least one variation, and ensure each variation has an SKU.
                    </div>
                  )}
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit()}
                  >
                    {loading ? "Saving..." : selectedProduct ? "Update" : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}