import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithGlobalSearch from "../../component/common/TableWithGlobalSearch";
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
    accessor: "rating",
    header: "Rating",
    cell: ({ rating }) => rating ? (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < rating ? '#ffd700' : '#ddd', fontSize: '16px' }}>
            ★
          </span>
        ))}
        <span style={{ marginLeft: '8px', fontSize: '12px' }}>({rating})</span>
      </div>
    ) : "No rating",
  },
  {
    accessor: "review_type",
    header: "Review Type",
    cell: ({ store_id, product_id }) => {
      if (store_id && product_id) {
        return "Store & Product";
      } else if (store_id) {
        return "Store";
      } else if (product_id) {
        return "Product";
      }
      return "Unknown";
    },
  },
  {
    accessor: "Store",
    header: "Store",
    cell: ({ Store }) => Store?.name || "N/A",
  },
  {
    accessor: "Product",
    header: "Product",
    cell: ({ Product }) => Product?.name || "N/A",
  },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const statusColors = {
        pending: { color: '#ff9800', bg: '#fff3e0' },
        approved: { color: '#4caf50', bg: '#e8f5e8' },
        rejected: { color: '#f44336', bg: '#ffebee' }
      };
      const statusConfig = statusColors[status] || statusColors.pending;
      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize',
            color: statusConfig.color,
            backgroundColor: statusConfig.bg,
            border: `1px solid ${statusConfig.color}`
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
    type: "select",
    options: [
      { value: "", label: "All Status" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  {
    key: "review_type",
    label: "Review Type",
    type: "select",
    options: [
      { value: "", label: "All Types" },
      { value: "store", label: "Store Reviews" },
      { value: "product", label: "Product Reviews" },
    ],
  },
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
    rating: "",
    status: "pending",
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
      const errorMessage = err.response?.data?.message || "Failed to fetch reviews";
      setError(errorMessage);
      toast.error(errorMessage);
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
      rating: "",
      status: "pending",
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
      rating: review.rating || "",
      status: review.status || "pending",
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
      toast.success(`Review from "${review.username}" deleted successfully`);
    } catch (err) {
      console.error("Error deleting review:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete review";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleApproveReview = async (review) => {
    if (
      !window.confirm(
        `Are you sure you want to approve this review from "${review.username}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminReviewService.approveReview(review.id);
      await fetchReviews();
      toast.success(`Review from "${review.username}" approved successfully`);
    } catch (err) {
      console.error("Error approving review:", err);
      const errorMessage = err.response?.data?.message || "Failed to approve review";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleRejectReview = async (review) => {
    if (
      !window.confirm(
        `Are you sure you want to reject this review from "${review.username}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminReviewService.rejectReview(review.id);
      await fetchReviews();
      toast.success(`Review from "${review.username}" rejected successfully`);
    } catch (err) {
      console.error("Error rejecting review:", err);
      const errorMessage = err.response?.data?.message || "Failed to reject review";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (selectedReview) {
        await adminReviewService.updateReview(selectedReview.id, formData);
        toast.success("Review updated successfully!");
      } else {
        await adminReviewService.createReview(formData);
        toast.success("Review created successfully!");
      }
      setShowModal(false);
      await fetchReviews();
    } catch (err) {
      console.error("Error saving review:", err);
      const errorMessage = err.response?.data?.message || "Failed to save review";
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
    { variant: "edit", tooltip: "Edit", onClick: handleEditReview },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteReview },
  ];

  // Conditional actions based on review status
  const getReviewActions = (review) => {
    const baseActions = [
      { variant: "edit", tooltip: "Edit", onClick: handleEditReview },
      { variant: "delete", tooltip: "Delete", onClick: handleDeleteReview },
    ];

    if (review.status === 'pending') {
      return [
        ...baseActions,
        { 
          variant: "approve", 
          tooltip: "Approve", 
          onClick: handleApproveReview,
          style: { backgroundColor: '#4caf50', color: 'white' }
        },
        { 
          variant: "reject", 
          tooltip: "Reject", 
          onClick: handleRejectReview,
          style: { backgroundColor: '#f44336', color: 'white' }
        }
      ];
    }

    return baseActions;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Store & Product Reviews Management</h2>
      </div>

      {/* Reviews stats */}
      <div className="dashboard-stats" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon products">R</div>
          <div className="stat-body">
            <div className="stat-label">Total Reviews</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{reviews.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending Reviews</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{reviews.filter(r=>r.status==='pending').length}</span>}</div>
          </div>
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

      <TableWithGlobalSearch
        columns={columns}
        data={reviews}
        searchFields={["message", "Store.name", "Product.name"]}
        filters={filters}
        actions={actions}
        loading={loading}
        getActions={getReviewActions}
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

          <InputField
            label="Rating"
            type="select"
            value={formData.rating}
            onChange={(e) => handleInputChange("rating", e.target.value)}
            options={[
              { value: "", label: "Select Rating" },
              { value: "1", label: "1 Star" },
              { value: "2", label: "2 Stars" },
              { value: "3", label: "3 Stars" },
              { value: "4", label: "4 Stars" },
              { value: "5", label: "5 Stars" },
            ]}
            placeholder="Select rating (optional)"
          />

          <InputField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
            placeholder="Select status"
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
