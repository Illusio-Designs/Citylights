import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminStoreService } from "../../services/adminService";

const columns = [
  {
    header: "Logo",
    accessor: "logo",
    cell: ({ logo, name }) =>
      logo ? (
        <img
          src={`http://localhost:5001/uploads/logos/${logo}`}
          alt={name}
          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "inline";
          }}
        />
      ) : (
        <div
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#e0e0e0",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#666",
          }}
        >
          No Logo
        </div>
      ),
    width: "70px",
    align: "center",
  },
  { accessor: "name", header: "Store Name" },
  { accessor: "address", header: "Address" },
  { accessor: "phone", header: "Phone" },
  { accessor: "email", header: "Email" },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const color =
        status === "active"
          ? "green"
          : status === "inactive"
          ? "red"
          : "orange";
      return (
        <span
          style={{
            color,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {status}
        </span>
      );
    },
  },
];

const filters = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];

export default function StoresPage() {
  const [showModal, setShowModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    map_location_url: "",
    logo: null,
    images: [],
    shop_timings: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  const fetchStores = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminStoreService.getStores();
      setStores(res.data);
    } catch (err) {
      console.error("Error fetching stores:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch stores";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleAddStore = () => {
    setSelectedStore(null);
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      whatsapp_number: "",
      email: "",
      map_location_url: "",
      logo: null,
      images: [],
      shop_timings: "",
    });
    setLogoPreview(null);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      description: store.description || "",
      address: store.address || "",
      phone: store.phone || "",
      whatsapp_number: store.whatsapp_number || "",
      email: store.email || "",
      map_location_url: store.map_location_url || "",
      logo: null,
      images: [],
      shop_timings: store.shop_timings || "",
    });
    setLogoPreview(
      store.logo ? `http://localhost:5001/uploads/logos/${store.logo}` : null
    );
    setImagePreviews(
      Array.isArray(store.images)
        ? store.images.map((img) => `http://localhost:5001/uploads/images/${img}`)
        : []
    );
    setShowModal(true);
  };

  const handleDeleteStore = async (store) => {
    if (!window.confirm(`Are you sure you want to delete "${store.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminStoreService.deleteStore(store.id);
      await fetchStores();
      toast.success(`Store "${store.name}" deleted successfully`);
    } catch (err) {
      console.error("Error deleting store:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete store";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
      // Optionally, set an error state here for invalid file type
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...files],
      }));
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (selectedStore) {
        await adminStoreService.updateStore(selectedStore.id, formData);
        toast.success("Store updated successfully!");
      } else {
        await adminStoreService.createStore(formData);
        toast.success("Store created successfully!");
      }
      setShowModal(false);
      await fetchStores();
    } catch (err) {
      console.error("Error saving store:", err);
      const errorMessage = err.response?.data?.message || "Failed to save store";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setLogoPreview(null);
    setImagePreviews([]);
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditStore },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteStore },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Stores Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddStore}>Add Store</Button>
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
        data={stores}
        searchFields={["name", "address", "email"]}
        filters={filters}
        actions={actions}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedStore ? "Edit Store" : "Add Store"}
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Store Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            placeholder="Enter store name"
          />

          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            multiline
            rows={3}
            placeholder="Enter store description"
          />

          <InputField
            label="Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            multiline
            rows={2}
            placeholder="Enter store address"
          />

          <InputField
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter phone number"
          />

          <InputField
            label="WhatsApp Number"
            value={formData.whatsapp_number}
            onChange={(e) =>
              handleInputChange("whatsapp_number", e.target.value)
            }
            placeholder="Enter WhatsApp number"
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            type="email"
            placeholder="Enter email address"
          />

          <InputField
            label="Map Location URL"
            value={formData.map_location_url}
            onChange={(e) =>
              handleInputChange("map_location_url", e.target.value)
            }
            placeholder="Enter Google Maps URL"
          />

          <InputField
            label="Shop Timings"
            value={formData.shop_timings}
            onChange={(e) => handleInputChange("shop_timings", e.target.value)}
            placeholder="e.g. 10:00 AM - 8:00 PM"
          />

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Store Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
            {logoPreview && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{
                    maxWidth: 100,
                    maxHeight: 100,
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    background: "#fff",
                    objectFit: "contain",
                  }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/100?text=No+Image";
                  }}
                />
              </div>
            )}
            {selectedStore?.logo && !logoPreview && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  Current logo:
                </p>
                <img
                  src={`http://localhost:5001/uploads/logos/${selectedStore.logo}`}
                  alt="Current Logo"
                  style={{
                    maxWidth: 100,
                    maxHeight: 100,
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Store Images (Max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
            {imagePreviews.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(selectedStore?.images) &&
              selectedStore.images.length > 0 &&
              imagePreviews.length === 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                    Current images:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedStore.images.map((image, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5001/uploads/images/${image}`}
                        alt={`Current ${index + 1}`}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 4,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>

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

          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              type="button"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : selectedStore ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
