import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithGlobalSearch from "../../component/common/TableWithGlobalSearch";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminPhoneService } from "../../services/adminService";

const columns = [
  { 
    accessor: "phone", 
    header: "Phone Number",
    cell: ({ phone }) => (
      <a 
        href={`tel:${phone}`} 
        style={{ color: '#007bff', textDecoration: 'none', fontWeight: 500 }}
      >
        {phone}
      </a>
    )
  },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const statusColors = {
        pending: { color: '#ff9800', bg: '#fff3e0' },
        contacted: { color: '#2196f3', bg: '#e3f2fd' },
        converted: { color: '#4caf50', bg: '#e8f5e8' }
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
      { value: "contacted", label: "Contacted" },
      { value: "converted", label: "Converted" },
    ],
  },
];

export default function PhonePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [phoneSubmissions, setPhoneSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});

  const fetchPhoneSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminPhoneService.getAllPhoneSubmissions();
      const submissionsData = res.data.data || [];
      setPhoneSubmissions(submissionsData);
      applyFilters(submissionsData, selectedFilters);
    } catch (err) {
      console.error("Error fetching phone submissions:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch phone submissions";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const applyFilters = (data, filters) => {
    let filtered = [...data];
    
    if (filters.status) {
      filtered = filtered.filter(submission => submission.status === filters.status);
    }
    
    setFilteredSubmissions(filtered);
  };

  const handleFiltersChange = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    applyFilters(phoneSubmissions, newFilters);
  };

  useEffect(() => {
    fetchPhoneSubmissions();
  }, []);

  useEffect(() => {
    applyFilters(phoneSubmissions, selectedFilters);
  }, [phoneSubmissions]);

  const handleCall = (submission) => {
    window.open(`tel:${submission.phone}`, '_self');
  };

  const handleMarkContacted = async (submission) => {
    if (!window.confirm(`Mark phone number "${submission.phone}" as contacted?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminPhoneService.updatePhoneStatus(submission.id, 'contacted');
      await fetchPhoneSubmissions();
      toast.success(`Phone number "${submission.phone}" marked as contacted`);
    } catch (err) {
      console.error("Error updating phone submission:", err);
      const errorMessage = err.response?.data?.message || "Failed to update phone submission";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleEditPhone = (submission) => {
    setSelectedSubmission(submission);
    setEditStatus(submission.status);
    setShowEditModal(true);
  };

  const handleUpdatePhone = async () => {
    if (!selectedSubmission || !editStatus) return;

    setLoading(true);
    setError("");
    try {
      await adminPhoneService.updatePhoneStatus(selectedSubmission.id, editStatus);
      await fetchPhoneSubmissions();
      setShowEditModal(false);
      setSelectedSubmission(null);
      setEditStatus("");
      toast.success(`Phone submission status updated successfully`);
    } catch (err) {
      console.error("Error updating phone submission:", err);
      const errorMessage = err.response?.data?.message || "Failed to update phone submission";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedSubmission(null);
    setEditStatus("");
    setError("");
  };

  const handleDeletePhone = async (submission) => {
    if (!window.confirm(`Delete phone number "${submission.phone}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminPhoneService.deletePhoneSubmission(submission.id);
      await fetchPhoneSubmissions();
      toast.success(`Phone number "${submission.phone}" deleted`);
    } catch (err) {
      console.error("Error deleting phone submission:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete phone submission";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditPhone },
    { variant: "delete", tooltip: "Delete", onClick: handleDeletePhone },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Phone Submissions</h2>
      </div>

      {/* Phone stats */}
      <div className="dashboard-stats" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon products">P</div>
          <div className="stat-body">
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{filteredSubmissions.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{filteredSubmissions.filter(p=>p.status==='pending').length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">C</div>
          <div className="stat-body">
            <div className="stat-label">Converted</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{filteredSubmissions.filter(p=>p.status==='converted').length}</span>}</div>
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
        data={filteredSubmissions}
        searchFields={["phone"]}
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        actions={actions}
        loading={loading}
      />

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Phone Submission"
      >
        {selectedSubmission && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Phone:</strong> {selectedSubmission.phone}</p>
            </div>
            
            <InputField
              label="Status"
              type="select"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { value: "pending", label: "Pending" },
                { value: "contacted", label: "Contacted" },
                { value: "converted", label: "Converted" },
              ]}
              required
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
              <Button variant="secondary" onClick={handleCloseEditModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdatePhone}
                disabled={!editStatus || loading}
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}