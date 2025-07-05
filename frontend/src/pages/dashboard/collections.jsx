import React, { useState, useEffect } from "react";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminCollectionService } from "../../services/adminService";

const columns = [
  {
    header: "Image",
    accessor: "image",
    cell: ({ image }) =>
      image ? (
        <img
          src={`http://localhost:5001/uploads/collections/${image}`}
          alt="Collection"
          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "inline";
          }}
        />
      ) : (
        <span style={{ color: "#aaa" }}>No Image</span>
      ),
    width: "70px",
    align: "center",
  },
  { accessor: "name", header: "Name" },
  { accessor: "description", header: "Description" },
  {
    accessor: "created_at",
    header: "Created",
    cell: ({ created_at }) => {
      return created_at ? new Date(created_at).toLocaleDateString() : "-";
    },
  },
  {
    accessor: "updated_at",
    header: "Updated",
    cell: ({ updated_at }) => {
      return updated_at ? new Date(updated_at).toLocaleDateString() : "-";
    },
  },
];

const filters = [{ key: "name", label: "Name", type: "text" }];

export default function CollectionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminCollectionService.getCollections();
      setCollections(res.data);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError(err.response?.data?.message || "Failed to fetch collections");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleAddCollection = () => {
    setSelectedCollection(null);
    setFormData({
      name: "",
      description: "",
      image: null,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      image: null,
    });
    setImagePreview(
      collection.image
        ? `http://localhost:5001/api/uploads/collections/${collection.image}`
        : null
    );
    setShowModal(true);
  };

  const handleDeleteCollection = async (collection) => {
    if (
      !window.confirm(`Are you sure you want to delete "${collection.name}"?`)
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminCollectionService.deleteCollection(collection.id);
      await fetchCollections();
    } catch (err) {
      console.error("Error deleting collection:", err);
      setError(err.response?.data?.message || "Failed to delete collection");
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (selectedCollection) {
        await adminCollectionService.updateCollection(
          selectedCollection.id,
          formData
        );
      } else {
        await adminCollectionService.createCollection(formData);
      }
      setShowModal(false);
      await fetchCollections();
    } catch (err) {
      console.error("Error saving collection:", err);
      setError(err.response?.data?.message || "Failed to save collection");
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setImagePreview(null);
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditCollection },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteCollection },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Collections Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddCollection}>Add Collection</Button>
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
        data={collections}
        searchFields={["name", "description"]}
        filters={filters}
        actions={actions}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedCollection ? "Edit Collection" : "Add Collection"}
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            placeholder="Enter collection name"
          />

          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            multiline
            rows={3}
            placeholder="Enter collection description"
          />

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Collection Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
            {selectedCollection?.image && !imagePreview && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  Current image:
                </p>
                <img
                  src={`http://localhost:5001/api/uploads/collections/${selectedCollection.image}`}
                  alt="Current"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
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
              {loading ? "Saving..." : selectedCollection ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
