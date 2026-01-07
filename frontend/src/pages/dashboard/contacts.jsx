import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminContactService } from "../../services/adminService";

const columns = [
  { accessor: "name", header: "Name" },
  { accessor: "email", header: "Email" },
  { accessor: "phone", header: "Phone" },
  { accessor: "subject", header: "Subject" },
  {
    accessor: "message",
    header: "Message",
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
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const statusColors = {
        pending: { color: '#ff9800', bg: '#fff3e0' },
        contacted: { color: '#2196f3', bg: '#e3f2fd' },
        resolved: { color: '#4caf50', bg: '#e8f5e8' }
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
      { value: "pending", label: "Pending" },
      { value: "contacted", label: "Contacted" },
      { value: "resolved", label: "Resolved" },
    ],
  },
];

export default function ContactsPage() {
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminContactService.getAllContacts();
      setContacts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch contacts";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleMarkContacted = async (contact) => {
    if (!window.confirm(`Mark contact from "${contact.name}" as contacted?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminContactService.updateContactStatus(contact.id, 'contacted');
      await fetchContacts();
      toast.success(`Contact from "${contact.name}" marked as contacted`);
    } catch (err) {
      console.error("Error updating contact:", err);
      const errorMessage = err.response?.data?.message || "Failed to update contact";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleMarkResolved = async (contact) => {
    if (!window.confirm(`Mark contact from "${contact.name}" as resolved?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminContactService.updateContactStatus(contact.id, 'resolved');
      await fetchContacts();
      toast.success(`Contact from "${contact.name}" marked as resolved`);
    } catch (err) {
      console.error("Error updating contact:", err);
      const errorMessage = err.response?.data?.message || "Failed to update contact";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContact(null);
    setError("");
  };

  const getContactActions = (contact) => {
    const baseActions = [
      { variant: "view", tooltip: "View Details", onClick: handleViewContact },
    ];

    if (contact.status === 'pending') {
      return [
        ...baseActions,
        { 
          variant: "approve", 
          tooltip: "Mark Contacted", 
          onClick: handleMarkContacted,
          style: { backgroundColor: '#2196f3', color: 'white' }
        }
      ];
    } else if (contact.status === 'contacted') {
      return [
        ...baseActions,
        { 
          variant: "complete", 
          tooltip: "Mark Resolved", 
          onClick: handleMarkResolved,
          style: { backgroundColor: '#4caf50', color: 'white' }
        }
      ];
    }

    return baseActions;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Contact Management</h2>
      </div>

      {/* Contact stats */}
      <div className="dashboard-stats" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon products">C</div>
          <div className="stat-body">
            <div className="stat-label">Total Contacts</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{contacts.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{contacts.filter(c=>c.status==='pending').length}</span>}</div>
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
        data={contacts}
        searchFields={["name", "email", "subject"]}
        filters={filters}
        actions={[]}
        loading={loading}
        getActions={getContactActions}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Contact Details"
      >
        {selectedContact && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Name:</strong> {selectedContact.name}</p>
              <p><strong>Email:</strong> {selectedContact.email}</p>
              <p><strong>Phone:</strong> {selectedContact.phone}</p>
              <p><strong>Subject:</strong> {selectedContact.subject}</p>
              <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedContact.status}</span></p>
              <p><strong>Submitted:</strong> {new Date(selectedContact.created_at).toLocaleString()}</p>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Message:</strong>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {selectedContact.message || 'No message provided'}
              </div>
            </div>

            <div className="modal-actions">
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}