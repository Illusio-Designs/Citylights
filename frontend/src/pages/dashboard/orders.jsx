import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithGlobalSearch from "../../component/common/TableWithGlobalSearch";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminOrderService } from "../../services/adminService";

const columns = [
  { accessor: "orderNumber", header: "Order #" },
  { accessor: "storeOwnerName", header: "Store Owner" },
  { accessor: "productName", header: "Product" },
  { accessor: "quantity", header: "Quantity" },
  { accessor: "totalAmount", header: "Total Amount" },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const color =
        status === "approved"
          ? "green"
          : status === "pending"
          ? "orange"
          : status === "rejected"
          ? "red"
          : "gray";
      return (
        <span
          style={{
            color,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {status}
        </span>
      );
    },
  },
  { accessor: "notes", header: "Notes" },
  { accessor: "createdAt", header: "Order Date" },
];

const getFilters = (filterOptions) => [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All Status" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  {
    key: "storeName",
    label: "Store Owner",
    options: [
      { value: "", label: "All Store Owners" },
      ...filterOptions.storeOwners
    ],
  },
  {
    key: "productName",
    label: "Product",
    options: [
      { value: "", label: "All Products" },
      ...filterOptions.products
    ],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ status: '', storeName: '', productName: '' });
  const [responseNotes, setResponseNotes] = useState("");
  const [filterOptions, setFilterOptions] = useState({ storeOwners: [], products: [] });

  const fetchOrders = async (filters = selectedFilters) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminOrderService.getOrders(filters);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch orders";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await adminOrderService.getFilterOptions();
      setFilterOptions(res.data.data || { storeOwners: [], products: [] });
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchOrders(selectedFilters);
  }, [selectedFilters]);

  const handleFiltersChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApproveOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to approve order #${order.orderNumber}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminOrderService.approveOrder(order.id);
      await fetchOrders();
      toast.success(`Order #${order.orderNumber} approved successfully`);
    } catch (err) {
      console.error("Error approving order:", err);
      const errorMessage = err.response?.data?.message || "Failed to approve order";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleRejectOrder = async (order) => {
    setSelectedOrder(order);
    setResponseNotes("");
    setShowModal(true);
  };

  const handleSubmitRejection = async (e) => {
    e.preventDefault();
    if (!responseNotes.trim()) {
      toast.error("Please provide rejection notes");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminOrderService.rejectOrder(selectedOrder.id, { notes: responseNotes });
      await fetchOrders();
      setShowModal(false);
      toast.success(`Order #${selectedOrder.orderNumber} rejected successfully`);
    } catch (err) {
      console.error("Error rejecting order:", err);
      const errorMessage = err.response?.data?.message || "Failed to reject order";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setResponseNotes("");
    setError("");
  };

  const actions = [
    { 
      variant: "approve", 
      tooltip: "Approve", 
      onClick: handleApproveOrder,
      show: (order) => order.status === "pending"
    },
    { 
      variant: "reject", 
      tooltip: "Reject", 
      onClick: handleRejectOrder,
      show: (order) => order.status === "pending"
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Store Owner Orders</h2>
      </div>

      {/* Orders stats */}
      <div className="dashboard-stats" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon orders">O</div>
          <div className="stat-body">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{orders.length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">P</div>
          <div className="stat-body">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{orders.filter(o=>o.status==='pending').length}</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">₹</div>
          <div className="stat-body">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">{loading ? <span className="dots"><span></span><span></span><span></span></span> : <span className="count-animate">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(orders.reduce((s,o)=>s + (parseFloat(o.totalAmount||o.total_amount||0)||0),0))}</span>}</div>
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
        data={orders}
        searchFields={["orderNumber", "storeOwnerName", "productName"]}
        filters={getFilters(filterOptions)}
        actions={actions}
        loading={loading}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={`Reject Order #${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleSubmitRejection}>
          <div style={{ marginBottom: 16 }}>
            <p><strong>Store Owner:</strong> {selectedOrder?.storeOwnerName}</p>
            <p><strong>Product:</strong> {selectedOrder?.productName}</p>
            <p><strong>Quantity:</strong> {selectedOrder?.quantity}</p>
            <p><strong>Original Notes:</strong> {selectedOrder?.notes || "None"}</p>
          </div>

          <InputField
            label="Rejection Notes"
            value={responseNotes}
            onChange={(e) => setResponseNotes(e.target.value)}
            type="textarea"
            required
            placeholder="Please provide a reason for rejection"
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
            <Button variant="danger" type="submit" disabled={loading || !responseNotes.trim()}>
              {loading ? "Rejecting..." : "Reject Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 