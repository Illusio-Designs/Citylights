import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminSliderService, adminCollectionService } from "../../services/adminService";
import Loader from "../../component/Loader";
import { getSliderImageUrl } from "../../utils/imageUtils";
import "../../styles/dashboard/management.css";

const columns = [
  { accessor: "title", header: "Title" },
  { 
    accessor: "description", 
    header: "Description",
    cell: ({ description }) => (
      <div style={{ 
        maxWidth: "200px", 
        overflow: "hidden", 
        textOverflow: "ellipsis", 
        whiteSpace: "nowrap" 
      }}>
        {description || "-"}
      </div>
    )
  },
  { 
    accessor: "collection", 
    header: "Category", 
    cell: ({ collection }) => collection?.name || collection?.title || "-"
  },
  { accessor: "button_text", header: "Button Text" },
  { 
    accessor: "image", 
    header: "Image", 
    cell: ({ image }) => image ? (
      <div style={{ position: 'relative', width: 80, height: 40 }}>
        <img 
          src={getSliderImageUrl(image)} 
          alt="slider" 
          style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          style={{ 
            display: 'none', 
            width: 80, 
            height: 40, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 4, 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '10px',
            color: '#999',
            border: '1px solid #ddd'
          }}
        >
          Missing
        </div>
      </div>
    ) : (
      <span style={{ color: '#666', fontSize: '12px' }}>No Image</span>
    ),
    width: "100px",
    align: "center",
  },
];



export default function SliderManagement() {
  const [sliders, setSliders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    id: "",
    button_text: "",
    slider_image: null,
  });
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fetchSliders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminSliderService.getSliders();
      console.log("Sliders response:", res.data); // Debug log
      setSliders(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      const errorMessage = "Failed to fetch sliders. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const fetchCollections = async () => {
    try {
      const res = await adminCollectionService.getCollections();
      console.log("Collections response:", res.data); // Debug log
      setCollections(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections([]);
      toast.error("Failed to fetch collections");
    }
  };

  useEffect(() => {
    fetchSliders();
    fetchCollections();
  }, []);

  const handleAdd = () => {
    setEditingSlider(null);
    setForm({ title: "", description: "", id: "", button_text: "", slider_image: null });
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setForm({
      title: slider.title || "",
      description: slider.description || "",
      id: slider.collection_id || "",
      button_text: slider.button_text || "",
      slider_image: null,
    });
    setImagePreview(slider.image ? getSliderImageUrl(slider.image) : null);
    setModalOpen(true);
  };

  const handleDelete = async (slider) => {
    if (!window.confirm(`Are you sure you want to delete "${slider.title}"?`)) return;
    setLoading(true);
    setError("");
    try {
      await adminSliderService.deleteSlider(slider.id);
      await fetchSliders();
      toast.success(`Slider "${slider.title}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting slider:", error);
      const errorMessage = "Failed to delete slider. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "slider_image" && files && files[0]) {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("button_text", form.button_text);
      formData.append("collection_id", form.id);
      
      if (form.slider_image) {
        formData.append("slider_image", form.slider_image);
      }

      console.log("Form state before submission:", form);
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      if (!form.title) {
        setError("Title is required.");
        setLoading(false);
        return;
      }
      
      // Only require image for new sliders, not for updates
      if (!editingSlider && !form.slider_image) {
        setError("Image is required for new sliders.");
        setLoading(false);
        return;
      }

      if (editingSlider) {
        await adminSliderService.updateSlider(editingSlider.id, formData);
        toast.success("Slider updated successfully!");
      } else {
        await adminSliderService.createSlider(formData);
        toast.success("Slider created successfully!");
      }
      setModalOpen(false);
      setImagePreview(null);
      await fetchSliders();
    } catch (error) {
      console.error("Error saving slider:", error);
      const errorMessage = error.response?.data?.message || "Failed to save slider. Please check your input and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCleanupMissingImages = async () => {
    if (!window.confirm("This will remove image references for sliders with missing image files. Continue?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await adminSliderService.cleanupMissingImages();
      console.log("Cleanup results:", response.data);
      toast.success(`Cleanup completed. ${response.data.results.length} sliders updated.`);
      await fetchSliders();
    } catch (error) {
      console.error("Error during cleanup:", error);
      toast.error("Failed to cleanup missing images");
    }
    setLoading(false);
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEdit },
    { variant: "delete", tooltip: "Delete", onClick: handleDelete },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Slider Management</h2>
        <div className="header-controls">
          <Button variant="secondary" onClick={handleCleanupMissingImages} disabled={loading}>
            Cleanup Missing Images
          </Button>
          <Button variant="primary" onClick={handleAdd}>Add New Slider</Button>
        </div>
      </div>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      <TableWithControls
        columns={columns}
        data={sliders}
        searchFields={["title", "description"]}
        actions={actions}
        loading={loading}
      />
      <Modal isOpen={modalOpen} onClose={() => {
        setModalOpen(false);
        setImagePreview(null);
        setError("");
      }} title={editingSlider ? "Edit Slider" : "Add New Slider"}>
        <form className="slider-form" onSubmit={handleSubmit}>
          <InputField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            required
            placeholder="Enter slider title"
          />
          <InputField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            multiline
            placeholder="Enter description"
          />
          <InputField
            label="Category"
            name="id"
            type="select"
            value={form.id}
            onChange={handleInputChange}
            required
            options={[
              { value: "", label: "Select Category" },
              ...collections.map((col) => ({ value: col.id, label: col.name || col.title })),
            ]}
          />
          <InputField
            label="Button Text"
            name="button_text"
            value={form.button_text}
            onChange={handleInputChange}
            placeholder="Enter button text (optional)"
          />
          <InputField
            label="Image"
            name="slider_image"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            placeholder="Choose image"
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                {editingSlider && !form.slider_image ? "Current Image:" : "Image Preview:"}
              </label>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  console.error("Error loading image preview:", e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
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
          
          <div className="slider-form-actions">
            <Button variant="secondary" onClick={() => {
              setModalOpen(false);
              setImagePreview(null);
              setError("");
            }} type="button">Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
