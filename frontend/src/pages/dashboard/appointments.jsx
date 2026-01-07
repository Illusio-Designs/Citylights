import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminAppointmentService } from "../../services/adminService";

const columns = [
  { accessor: "name", header: "Name" },
  { accessor: "email", header: "Email" },
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
    accessor: "inquiry", 
    header: "Inquiry",
    cell: ({ inquiry }) => (
      <div
        style={{
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {inquiry}
      </div>
    )
  },
  { accessor: "store_name", header: "Store" },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const statusColors = {
        pending: { color: '#ff9800', bg: '#fff3e0' },
        confirmed: { color: '#2196f3', bg: '#e3f2fd' },
        completed: { color: '#4caf50', bg: '#e8f5e8' },
        cancelled: { color: '#f44336', bg: '#ffebee' }
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
      { value: "confirmed", label: "Confirmed" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export default function AppointmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAppointmentService.getAllAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch appointments";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleConfirmAppointment = async (appointment) => {
    if (!window.confirm(`Confirm appointment for "${appointment.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminAppointmentService.updateAppointmentStatus(appointment.id, 'confirmed');
      await fetchAppointments();
      toast.success(`Appointment for "${appointment.name}" confirmed`);
    } catch (err) {
      console.error("Error updating appointment:", err);
      const errorMessage = err.response?.data?.message || "Failed to update appointment";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCompleteAppointment = async (appointment) => {
    if (!window.confirm(`Mark appointment for "${appointment.name}" as completed?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminAppointmentService.updateAppointmentStatus(appointment.id, 'completed');
      await fetchAppointments();
      toast.success(`Appointment for "${appointment.name}" marked as completed`);
    } catch (err) {
      console.error("Error updating appointment:", err);
      const errorMessage = err.response?.data?.message || "Failed to update appointment";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCancelAppointment = async (appointment) => {
    if (!window.confirm(`Cancel appointment for "${appointment.name}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminAppointmentService.updateAppointmentStatus(appointment.id, 'cancelled');
      await fetchAppointments();
      toast.success(`Appointment for "${appointment.name}" cancelled`);
    } catch (err) {
      console.error("Error updating appointment:", err);
      const errorMessage = err.response?.data?.message || "Failed to update appointment";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setError("");
  };

  const getAppointmentActions = (appointment) => {
    const baseActions = [
      { variant: "view", tooltip: "View Details", onClick: handleViewAppointment },
    ];

    if (appointment.status === 'pending') {
      return [
        ...baseActions,
        { 
          variant: "approve", 
          tooltip: "Confirm", 
          onClick: handleConfirmAppointment,
          style: { backgroundColor: '#2196f3', color: 'white' }
        },
        { 
          variant: "reject", 
          tooltip: "Cancel", 
          onClick: handleCancelAppointment,
          style: { backgroundColor: '#f44336', color: 'white' }
        }
      ];
    } else if (appointment.status === 'confirmed') {
      return [
        ...baseActions,
        { 
          variant: "complete", 
          tooltip: "Complete", 
          onClick: handleCompleteAppointment,
          style: { backgroundColor: '#4caf50', color: 'white' }
        },
        { 
          variant: "reject", 
          tooltip: "Cancel", 
          onClick: handleCancelAppointment,
          style: { backgroundColor: '#f44336', color: 'white' }
        }
      ];
    }

    return baseActions;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Appointments Management</h2>
      </div>

      {/* Appointment stats */}
      <div className="dashboard-stats" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon products">A</div>
          <div className="stat-body">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{appointments.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{appointments.filter(a=>a.status==='pending').length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">C</div>
          <div className="stat-body">
            <div className="stat-label">Confirmed</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{appointments.filter(a=>a.status==='confirmed').length}</span>}</div>
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
        data={appointments}
        searchFields={["name", "email", "phone"]}
        filters={filters}
        actions={[]}
        loading={loading}
        getActions={getAppointmentActions}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Name:</strong> {selectedAppointment.name}</p>
              <p><strong>Email:</strong> {selectedAppointment.email}</p>
              <p><strong>Phone:</strong> 
                <a href={`tel:${selectedAppointment.phone}`} style={{ color: '#007bff', marginLeft: 8 }}>
                  {selectedAppointment.phone}
                </a>
              </p>
              <p><strong>Store:</strong> {selectedAppointment.store_name || 'N/A'}</p>
              <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedAppointment.status}</span></p>
              <p><strong>Submitted:</strong> {new Date(selectedAppointment.created_at).toLocaleString()}</p>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Inquiry:</strong>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {selectedAppointment.inquiry || 'No inquiry provided'}
              </div>
            </div>

            {selectedAppointment.notes && (
              <div style={{ marginBottom: 16 }}>
                <strong>Notes:</strong>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: 12, 
                  borderRadius: 6, 
                  marginTop: 8,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}>
                  {selectedAppointment.notes}
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
    </div>
  );
}