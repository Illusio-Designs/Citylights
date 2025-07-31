import React, { useState, useEffect } from "react";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import {
  adminProductService,
  adminCollectionService,
} from "../../services/adminService";

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

const filters = [
  { key: "name", label: "Product Name", type: "text" },
  { key: "slug", label: "Slug", type: "text" },
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
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch products");
    }
    setLoading(false);
  };

  const fetchCollections = async () => {
    try {
      const res = await adminCollectionService.getCollections();
      setCollections(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  };

  // Log collection_id when fetching collections
  useEffect(() => {
    fetchCollections();
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
      id: "",
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
    const transformedVariations = (product.ProductVariations || []).map((variation) => ({
      ...variation,
      // Convert ProductImages to images array with preview and is_primary
      images: (variation.ProductImages || []).map((img) => ({
        preview: img.image_url.startsWith('http') 
          ? img.image_url 
          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/products/${img.image_url}`,
        is_primary: img.is_primary,
        id: img.id,
        image_url: img.image_url,
        existing: true, // Mark as existing image
      })),
      // Ensure attributes is properly formatted
      attributes: variation.attributes || [],
    }));

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
      await adminProductService.deleteProduct(product.id);
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to delete product");
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
    if (!files || files.length === 0) return;
    
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === index
          ? {
              ...variation,
              images: [
                ...(variation.images || []),
                ...Array.from(files).map((file) => ({
                  file,
                  preview: URL.createObjectURL(file),
                  is_primary: (variation.images || []).length === 0, // First image is primary
                  existing: false,
                })),
              ],
            }
          : variation
      ),
    }));
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
          
          const hasImages = variation.images && variation.images.length > 0;
          if (!hasImages) {
            setError(`At least one image is required for variation ${i + 1}`);
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    setError("");
    if (validateStep(currentStep)) {
      nextStep();
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
      const variationsForBackend = formData.variations.map((variation, index) => ({
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
        formData.variations.forEach((variation, i) => {
          const existingImages = (variation.images || [])
            .filter(img => img.existing && (img.id || img.image_url))
            .map(img => img.id || img.image_url);
          
          if (existingImages.length > 0) {
            existingImages.forEach(imgId => {
              form.append(`existingImages[${i}][]`, imgId);
            });
          }
        });
      }

      // Attach new image files
      formData.variations.forEach((variation, i) => {
        const newImages = (variation.images || []).filter(img => img.file);
        newImages.forEach((img) => {
          form.append(`variation_images[${i}]`, img.file);
        });
      });

      // Debug log
      console.log("Submitting form data:", {
        name: formData.name,
        id: formData.id,
        slug: formData.slug,
        collection_id: parsedId, // Log the collection_id
        variations: variationsForBackend,
      });

      let response;
      if (selectedProduct) {
        response = await adminProductService.updateProduct(selectedProduct.id, form);
      } else {
        response = await adminProductService.createProduct(form);
      }

      // Check response
      if (response.data && response.data.success) {
        await fetchProducts();
        setShowModal(false);
        setCurrentStep(0);
        setError("");
      } else {
        setError(response.data?.error || "Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save product");
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setCurrentStep(0);
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
                {formData.variations.map((variation, index) => (
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
                        Images <span style={{ color: "red" }}>*</span>
                      </h5>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          handleVariationImageUpload(index, e.target.files)
                        }
                        style={{ marginBottom: "12px" }}
                      />

                      {variation.images && variation.images.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {variation.images.map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              style={{
                                position: "relative",
                                border: image.is_primary
                                  ? "3px solid #4caf50"
                                  : "1px solid #ddd",
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
                              />
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
                                    setPrimaryImage(index, imgIndex)
                                  }
                                  style={{
                                    padding: "2px 6px",
                                    backgroundColor: image.is_primary
                                      ? "#4caf50"
                                      : "#666",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                  }}
                                  title={
                                    image.is_primary
                                      ? "Primary"
                                      : "Set as Primary"
                                  }
                                >
                                  {image.is_primary ? "✓" : "P"}
                                </button>
                                <button
                                  onClick={() =>
                                    removeVariationImage(index, imgIndex)
                                  }
                                  style={{
                                    padding: "2px 6px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                  }}
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
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
                ))}
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
      return true; // Allow products without variations
    }
    
    return formData.variations.every(variation => {
      const hasValidSku = variation.sku && variation.sku.trim();
      const hasImages = (variation.images || []).length > 0;
      return hasValidSku && hasImages;
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
        filters={filters}
        actions={actions}
        loading={loading}
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
                      Please fill all required fields and ensure each variation has an SKU and at least one image.
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