import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminHelpService, adminUserService } from "../../services/adminService";

const columns = [
  { accessor: "name", header: "Name" },
  { 
    accessor: "phone", 
    header: "Phone",
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
    accessor: "query", 
    header: "Query",
    cell: ({ query }) => (
      <div
        style={{
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {query}
      </div>
    )
  },
  { accessor: "store_name", header: "Store" },
  {
    accessor: "priority",
    header: "Priority",
    cell: ({ priority }) => {
      const priorityColors = {
        low: { color: '#4caf50', bg: '#e8f5e8' },
        medium: { color: '#2196f3', bg: '#e3f2fd' },
        high: { color: '#ff9800', bg: '#fff3e0' },
        urgent: { color: '#f44336', bg: '#ffebee' }
      };
      const priorityConfig = priorityColors[priority] || priorityColors.medium;
      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize',
            color: priorityConfig.color,
            backgroundColor: priorityConfig.bg,
            border: `1px solid ${priorityConfig.color}`
          }}
        >
          {priority}
        </span>
      );
    },
  },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const statusColors = {
        open: { color: '#ff9800', bg: '#fff3e0' },
        in_progress: { color: '#2196f3', bg: '#e3f2fd' },
        resolved: { color: '#4caf50', bg: '#e8f5e8' },
        closed: { color: '#9e9e9e', bg: '#f5f5f5' }
      };
      const statusConfig = statusColors[status] || statusColors.open;
      const label = status === "in_progress" ? "In Progress" : status;
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
          {label}
        </span>
      );
    },
  },
  { 
    accessor: "created_at", 
    header: "Date",
    cell: ({ created_at }) => new Date(created_at).toLocaleDateString()
  },
];

const filters = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "", label: "All Status" },
      { value: "open", label: "Open" },
      { value: "in_progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "closed", label: "Closed" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "", label: "All Priority" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
];

export default function HelpPage() {
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [helpRequests, setHelpRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignToUser, setAssignToUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHelpRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminHelpService.getAllHelpRequests();
      setHelpRequests(res.data.data || []);
    } catch (err) {
      console.error("Error fetching help requests:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch help requests";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await adminUserService.getUsers({ userType: 'admin' });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchHelpRequests();
    fetchUsers();
  }, []);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleStartRequest = async (request) => {
    if (!window.confirm(`Start working on request from "${request.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminHelpService.updateHelpRequestStatus(request.id, 'in_progress');
      await fetchHelpRequests();
      toast.success(`Help request from "${request.name}" started`);
    } catch (err) {
      console.error("Error updating help request:", err);
      const errorMessage = err.response?.data?.message || "Failed to update help request";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleResolveRequest = async (request) => {
    if (!window.confirm(`Mark request from "${request.name}" as resolved?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminHelpService.updateHelpRequestStatus(request.id, 'resolved');
      await fetchHelpRequests();
      toast.success(`Help request from "${request.name}" resolved`);
    } catch (err) {
      console.error("Error updating help request:", err);
      const errorMessage = err.response?.data?.message || "Failed to update help request";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseRequest = async (request) => {
    if (!window.confirm(`Close request from "${request.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminHelpService.updateHelpRequestStatus(request.id, 'closed');
      await fetchHelpRequests();
      toast.success(`Help request from "${request.name}" closed`);
    } catch (err) {
      console.error("Error updating help request:", err);
      const errorMessage = err.response?.data?.message || "Failed to update help request";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleAssignRequest = async () => {
    if (!selectedRequest || !assignToUser) return;
    
    setLoading(true);
    setError("");
    try {
      await adminHelpService.assignHelpRequest(selectedRequest.id, assignToUser);
      await fetchHelpRequests();
      setShowAssignModal(false);
      setAssignToUser("");
      toast.success("Request assigned successfully");
    } catch (err) {
      console.error("Error assigning help request:", err);
      const errorMessage = err.response?.data?.message || "Failed to assign help request";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setError("");
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedRequest(null);
    setAssignToUser("");
    setError("");
  };

  const getHelpActions = (request) => {
    const baseActions = [
      { variant: "view", tooltip: "View Details", onClick: handleViewRequest },
      { 
        variant: "assign", 
        tooltip: "Assign", 
        onClick: openAssignModal,
        style: { backgroundColor: '#17a2b8', color: 'white' }
      },
    ];

    if (request.status === 'open') {
      return [
        ...baseActions,
        { 
          variant: "approve", 
          tooltip: "Start", 
          onClick: handleStartRequest,
          style: { backgroundColor: '#2196f3', color: 'white' }
        }
      ];
    } else if (request.status === 'in_progress') {
      return [
        ...baseActions,
        { 
          variant: "complete", 
          tooltip: "Resolve", 
          onClick: handleResolveRequest,
          style: { backgroundColor: '#4caf50', color: 'white' }
        }
      ];
    } else if (request.status === 'resolved') {
      return [
        ...baseActions,
        { 
          variant: "close", 
          tooltip: "Close", 
          onClick: handleCloseRequest,
          style: { backgroundColor: '#9e9e9e', color: 'white' }
        }
      ];
    }

    return baseActions;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Help Requests</h2>
      </div>

      {/* Help stats */}
      <div className="dashboard-stats" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon products">H</div>
          <div className="stat-body">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{helpRequests.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">O</div>
          <div className="stat-body">
            <div className="stat-label">Open</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{helpRequests.filter(h=>h.status==='open').length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">U</div>
          <div className="stat-body">
            <div className="stat-label">Urgent</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{helpRequests.filter(h=>h.priority==='urgent').length}</span>}</div>
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

      <TableWithControls
        columns={columns}
        data={helpRequests}
        searchFields={["name", "phone", "query"]}
        filters={filters}
        actions={[]}
        loading={loading}
        getActions={getHelpActions}
      />

      {/* Request Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Help Request Details"
      >
        {selectedRequest && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>Phone:</strong> 
                <a href={`tel:${selectedRequest.phone}`} style={{ color: '#007bff', marginLeft: 8 }}>
                  {selectedRequest.phone}
                </a>
              </p>
              <p><strong>Store:</strong> {selectedRequest.store_name || 'N/A'}</p>
              <p><strong>Priority:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedRequest.priority}</span></p>
              <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedRequest.status.replace('_', ' ')}</span></p>
              <p><strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Query:</strong>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {selectedRequest.query}
              </div>
            </div>

            {selectedRequest.resolution_notes && (
              <div style={{ marginBottom: 16 }}>
                <strong>Resolution Notes:</strong>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: 12, 
                  borderRadius: 6, 
                  marginTop: 8,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}>
                  {selectedRequest.resolution_notes}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={handleCloseAssignModal}
        title="Assign Request"
      >
        <div>
          <InputField
            label="Assign to:"
            type="select"
            value={assignToUser}
            onChange={(e) => setAssignToUser(e.target.value)}
            options={[
              { value: "", label: "Select a user" },
              ...users.map(user => ({ 
                value: user.id, 
                label: `${user.fullName} (${user.email})` 
              }))
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
            <Button variant="secondary" onClick={handleCloseAssignModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAssignRequest}
              disabled={!assignToUser || loading}
            >
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}