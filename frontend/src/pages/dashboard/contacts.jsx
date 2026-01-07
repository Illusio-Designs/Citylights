import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithGlobalSearch from "../../component/common/TableWithGlobalSearch";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminContactService.getAllContacts();
      const contactsData = res.data.data || [];
      setContacts(contactsData);
      applyFilters(contactsData, selectedFilters);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch contacts";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const applyFilters = (data, filters) => {
    let filtered = [...data];
    
    if (filters.status) {
      filtered = filtered.filter(contact => contact.status === filters.status);
    }
    
    setFilteredContacts(filtered);
  };

  const handleFiltersChange = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    applyFilters(contacts, newFilters);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    applyFilters(contacts, selectedFilters);
  }, [contacts]);

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setEditStatus(contact.status);
    setShowEditModal(true);
  };

  const handleUpdateContact = async () => {
    if (!selectedContact || !editStatus) return;

    setLoading(true);
    setError("");
    try {
      await adminContactService.updateContactStatus(selectedContact.id, editStatus);
      await fetchContacts();
      setShowEditModal(false);
      setSelectedContact(null);
      setEditStatus("");
      toast.success(`Contact status updated successfully`);
    } catch (err) {
      console.error("Error updating contact:", err);
      const errorMessage = err.response?.data?.message || "Failed to update contact";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
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

  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Delete contact from "${contact.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminContactService.deleteContact(contact.id);
      await fetchContacts();
      toast.success(`Contact from "${contact.name}" deleted`);
    } catch (err) {
      console.error("Error deleting contact:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete contact";
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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedContact(null);
    setEditStatus("");
    setError("");
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditContact },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteContact },
  ];

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
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{filteredContacts.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{filteredContacts.filter(c=>c.status==='pending').length}</span>}</div>
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
        data={filteredContacts}
        searchFields={["name", "email", "subject"]}
        filters={filters}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        actions={actions}
        loading={loading}
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

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Contact"
      >
        {selectedContact && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Name:</strong> {selectedContact.name}</p>
              <p><strong>Email:</strong> {selectedContact.email}</p>
              <p><strong>Subject:</strong> {selectedContact.subject}</p>
            </div>
            
            <InputField
              label="Status"
              type="select"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { value: "pending", label: "Pending" },
                { value: "contacted", label: "Contacted" },
                { value: "resolved", label: "Resolved" },
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
                onClick={handleUpdateContact}
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