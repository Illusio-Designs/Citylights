import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminSliderService, adminCollectionService } from "../../services/adminService";
import Loader from "../../component/Loader";
import "../../styles/dashboard/management.css";

const columns = [
  { key: "title", header: "Title", render: row => row.title },
  { key: "description", header: "Description", render: row => row.description },
  { key: "category", header: "Category", render: row => row.collection?.name || row.collection?.title || "-" },
  { key: "button_text", header: "Button Text", render: row => row.button_text },
  { key: "image", header: "Image", render: row => row.image ? <img src={constructImageUrl(row.image)} alt="slider" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : "-" },
];

const constructImageUrl = (image) => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  return image.startsWith('http') ? image : `${baseUrl}/uploads/sliders/${image}`;
};

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

  const fetchSliders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminSliderService.getSliders();
      setSliders(res.data.data || res.data); // support both {data:[]} and []
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
      setCollections(res.data.data || res.data);
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
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
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
      formData.append("slider_image", form.slider_image);

      console.log("Form state before submission:", form); // Log form state
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      if (!form.title) {
        console.error("Title is required.");
        setError("Title is required.");
        setLoading(false);
        return;
      }
      if (!form.slider_image) {
        console.error("Image is required.");
        setError("Image is required.");
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
      await fetchSliders();
    } catch (error) {
      console.error("Error saving slider:", error);
      const errorMessage = "Failed to save slider. Please check your input and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSlider ? "Edit Slider" : "Add New Slider"}>
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
          <div className="slider-form-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
