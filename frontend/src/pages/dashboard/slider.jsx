import React, { useEffect, useState } from "react";
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
  { key: "image", header: "Image", render: row => row.image ? <img src={row.image.startsWith('http') ? row.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/sliders/${row.image}`} alt="slider" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : "-" },
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
    collection_id: "",
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
    } catch {
      setError("Failed to fetch sliders");
    }
    setLoading(false);
  };

  const fetchCollections = async () => {
    try {
      const res = await adminCollectionService.getCollections();
      setCollections(res.data.data || res.data);
    } catch {
      setCollections([]);
    }
  };

  useEffect(() => {
    fetchSliders();
    fetchCollections();
  }, []);

  const handleAdd = () => {
    setEditingSlider(null);
    setForm({ title: "", description: "", collection_id: "", button_text: "", slider_image: null });
    setModalOpen(true);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setForm({
      title: slider.title || "",
      description: slider.description || "",
      collection_id: slider.collection_id || "",
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
    } catch {
      setError("Failed to delete slider");
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
      if (editingSlider) {
        await adminSliderService.updateSlider(editingSlider.id, form);
      } else {
        await adminSliderService.createSlider(form);
      }
      setModalOpen(false);
      await fetchSliders();
    } catch {
      setError("Failed to save slider");
    }
    setLoading(false);
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEdit },
    { variant: "delete", tooltip: "Delete", onClick: handleDelete },
  ];

  return (
    <div className="management-page">
      <div className="management-container">
        <div className="management-header">
          <h1 className="title">Slider Management</h1>
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
      </div>
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
            name="collection_id"
            type="select"
            value={form.collection_id}
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
