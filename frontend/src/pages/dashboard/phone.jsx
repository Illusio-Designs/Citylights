import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithControls from "../../component/common/TableWithControls";
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
    accessor: "source", 
    header: "Source",
    cell: ({ source }) => (
      <span style={{ 
        backgroundColor: '#e9ecef', 
        color: '#495057', 
        padding: '4px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: 500 
      }}>
        {source || 'Website'}
      </span>
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
      { value: "converted", label: "Converted" },
    ],
  },
];

export default function PhonePage() {
  const [phoneSubmissions, setPhoneSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPhoneSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminPhoneService.getAllPhoneSubmissions();
      setPhoneSubmissions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching phone submissions:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch phone submissions";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhoneSubmissions();
  }, []);

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

  const handleMarkConverted = async (submission) => {
    if (!window.confirm(`Mark phone number "${submission.phone}" as converted?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminPhoneService.updatePhoneStatus(submission.id, 'converted');
      await fetchPhoneSubmissions();
      toast.success(`Phone number "${submission.phone}" marked as converted`);
    } catch (err) {
      console.error("Error updating phone submission:", err);
      const errorMessage = err.response?.data?.message || "Failed to update phone submission";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const getPhoneActions = (submission) => {
    const baseActions = [
      { 
        variant: "call", 
        tooltip: "Call", 
        onClick: handleCall,
        style: { backgroundColor: '#4caf50', color: 'white' }
      },
    ];

    if (submission.status === 'pending') {
      return [
        ...baseActions,
        { 
          variant: "approve", 
          tooltip: "Mark Contacted", 
          onClick: handleMarkContacted,
          style: { backgroundColor: '#2196f3', color: 'white' }
        }
      ];
    } else if (submission.status === 'contacted') {
      return [
        ...baseActions,
        { 
          variant: "complete", 
          tooltip: "Mark Converted", 
          onClick: handleMarkConverted,
          style: { backgroundColor: '#ff9800', color: 'white' }
        }
      ];
    }

    return baseActions;
  };

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
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{phoneSubmissions.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{phoneSubmissions.filter(p=>p.status==='pending').length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">C</div>
          <div className="stat-body">
            <div className="stat-label">Converted</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{phoneSubmissions.filter(p=>p.status==='converted').length}</span>}</div>
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
        data={phoneSubmissions}
        searchFields={["phone"]}
        filters={filters}
        actions={[]}
        loading={loading}
        getActions={getPhoneActions}
      />
    </div>
  );
}