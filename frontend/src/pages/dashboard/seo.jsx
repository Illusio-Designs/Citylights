import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import Button from "../../component/common/Button";
import { adminSeoService } from "../../services/adminService";
import "../../styles/dashboard/management.css";

const columns = [
  { accessor: "title", header: "Title" },
  { 
    accessor: "description", 
    header: "Description",
    cell: ({ description }) => (
      <div style={{ 
        maxWidth: "300px", 
        overflow: "hidden", 
        textOverflow: "ellipsis", 
        whiteSpace: "nowrap" 
      }}>
        {description || "-"}
      </div>
    )
  },
];

export default function SeoPage() {
  const [showModal, setShowModal] = useState(false);
  const [seoList, setSeoList] = useState([]);
  const [selectedSeo, setSelectedSeo] = useState(null);
  const [formData, setFormData] = useState({
    path: "",
    title: "",
    description: "",
    keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    noindex: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSeoList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminSeoService.getSeoList();
      console.log("SEO List response:", res.data); // Debug log
      setSeoList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching SEO list:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch SEO data";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSeoList();
  }, []);

  const handleEditSeo = (seo) => {
    setSelectedSeo(seo);
    setFormData({
      path: seo.path || "",
      title: seo.title || "",
      description: seo.description || "",
      keywords: seo.keywords || "",
      og_title: seo.og_title || "",
      og_description: seo.og_description || "",
      og_image: seo.og_image || "",
      noindex: seo.noindex || false,
    });
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await adminSeoService.upsertSeo(formData);
      toast.success("SEO data updated successfully!");
      setShowModal(false);
      await fetchSeoList();
    } catch (err) {
      console.error("Error saving SEO data:", err);
      const errorMessage = err.response?.data?.message || "Failed to save SEO data";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditSeo },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">SEO Management</h2>
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
        data={seoList}
        searchFields={["title", "description"]}
        actions={actions}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Edit SEO Data"
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Path"
            value={formData.path}
            onChange={(e) => handleInputChange("path", e.target.value)}
            required
            placeholder="e.g. /, /about, /products"
            disabled={!!selectedSeo}
          />

          <InputField
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter page title"
          />

          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            multiline
            rows={3}
            placeholder="Enter meta description"
          />

          <InputField
            label="Keywords"
            value={formData.keywords}
            onChange={(e) => handleInputChange("keywords", e.target.value)}
            placeholder="Enter keywords separated by commas"
          />

          <InputField
            label="OG Title"
            value={formData.og_title}
            onChange={(e) => handleInputChange("og_title", e.target.value)}
            placeholder="Enter Open Graph title"
          />

          <InputField
            label="OG Description"
            value={formData.og_description}
            onChange={(e) => handleInputChange("og_description", e.target.value)}
            multiline
            rows={2}
            placeholder="Enter Open Graph description"
          />

          <InputField
            label="OG Image URL"
            value={formData.og_image}
            onChange={(e) => handleInputChange("og_image", e.target.value)}
            placeholder="Enter Open Graph image URL"
          />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={formData.noindex}
                onChange={(e) => handleInputChange("noindex", e.target.checked)}
              />
              <span>No Index (prevent search engine indexing)</span>
            </label>
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
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !formData.path}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}