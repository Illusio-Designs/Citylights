import React, { useState, useEffect } from "react";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminReviewService } from "../../services/adminService";

const columns = [
  { accessor: "username", header: "Customer Name" },
  { accessor: "email", header: "Email" },
  { accessor: "phone_number", header: "Phone" },
  {
    accessor: "message",
    header: "Review Message",
    cell: ({ message }) => (
      <div
        style={{
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {message}
      </div>
    ),
  },
  {
    accessor: "Store",
    header: "Store",
    cell: ({ Store }) => Store?.name || "N/A",
  },
  {
    accessor: "created_at",
    header: "Date",
    cell: ({ created_at }) =>
      created_at ? new Date(created_at).toLocaleDateString() : "-",
  },
];

const filters = [
  { key: "username", label: "Customer Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
];

export default function ReviewsPage() {
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    message: "",
    store_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminReviewService.getReviews();
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.response?.data?.message || "Failed to fetch reviews");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = () => {
    setSelectedReview(null);
    setFormData({
      username: "",
      email: "",
      phone_number: "",
      message: "",
      store_id: "",
    });
    setShowModal(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setFormData({
      username: review.username,
      email: review.email,
      phone_number: review.phone_number,
      message: review.message,
      store_id: review.store_id,
    });
    setShowModal(true);
  };

  const handleDeleteReview = async (review) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this review from "${review.username}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminReviewService.deleteReview(review.id);
      await fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      setError(err.response?.data?.message || "Failed to delete review");
    }
    setLoading(false);
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
      if (selectedReview) {
        await adminReviewService.updateReview(selectedReview.id, formData);
      } else {
        await adminReviewService.createReview(formData);
      }
      setShowModal(false);
      await fetchReviews();
    } catch (err) {
      console.error("Error saving review:", err);
      setError(err.response?.data?.message || "Failed to save review");
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditReview },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteReview },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Reviews Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddReview}>Add Review</Button>
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
        data={reviews}
        searchFields={["username", "email", "message"]}
        filters={filters}
        actions={actions}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedReview ? "Edit Review" : "Add Review"}
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Customer Name"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            required
            placeholder="Enter customer name"
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            type="email"
            required
            placeholder="Enter email address"
          />

          <InputField
            label="Phone Number"
            value={formData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            required
            placeholder="Enter phone number"
          />

          <InputField
            label="Review Message"
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            multiline
            rows={4}
            required
            placeholder="Enter review message"
          />

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
              {loading ? "Saving..." : selectedReview ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
