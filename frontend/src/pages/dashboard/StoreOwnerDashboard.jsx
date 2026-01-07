import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableWithGlobalSearch from "../../component/common/TableWithGlobalSearch";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import { adminProductService, adminOrderService } from "../../services/adminService";
import "../../styles/dashboard/store-owner.css";

export default function StoreOwnerDashboard() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    productId: "",
    productName: "",
    quantity: 1,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [selectedFilters, setSelectedFilters] = useState({ status: '', name: '' });
  const [filterOptions, setFilterOptions] = useState({ products: [] });

  const userId = localStorage.getItem("store_owner_id");

  const columns = [
    { accessor: "name", header: "Product Name" },
    { accessor: "description", header: "Description" },
    {
      accessor: "ProductVariations",
      header: "Variations",
      cell: ({ ProductVariations }) => {
        if (!ProductVariations || ProductVariations.length === 0) {
          return <span style={{ color: "#999" }}>No variations</span>;
        }
        return (
          <div>
            {ProductVariations.map((variation) => (
              <div
                key={variation.id}
                style={{ fontSize: "12px", marginBottom: "2px" }}
              >
                {variation.sku} - ₹{variation.price || "0.00"}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessor: "actions",
      header: "Actions",
      cell: ({ id, name }) => (
        <Button
          variant="primary"
          size="small"
          onClick={() => {
            setSelectedProduct({ id, name });
            setOrderFormData({
              productId: id,
              productName: name,
              quantity: 1,
              notes: "",
            });
            setShowOrderModal(true);
          }}
        >
          Order
        </Button>
      ),
    },
  ];

  const orderColumns = [
    { accessor: "orderNumber", header: "Order #" },
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
    { accessor: "createdAt", header: "Order Date" },
  ];

  const getFilters = (filterOptions) => [
    {
      key: "name",
      label: "Product",
      options: [
        { value: "", label: "All Products" },
        ...filterOptions.products || []
      ],
    },
  ];

  const orderFilters = [
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
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminProductService.getProducts();
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to fetch products";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await adminProductService.getFilterOptions();
      setFilterOptions(res.data.data || { products: [] });
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const fetchOrders = async (filters = selectedFilters) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminOrderService.getStoreOwnerOrders(userId);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch orders";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders(selectedFilters);
    }
  }, [activeTab, selectedFilters]);

  const handleInputChange = (field, value) => {
    setOrderFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const orderData = {
        productId: orderFormData.productId,
        quantity: orderFormData.quantity,
        notes: orderFormData.notes,
        userId: parseInt(userId),
      };

      await adminOrderService.createOrder(orderData);
      toast.success("Order placed successfully!");
      setShowOrderModal(false);
      setActiveTab("orders");
      await fetchOrders();
    } catch (err) {
      console.error("Error placing order:", err);
      const errorMessage = err.response?.data?.message || "Failed to place order";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setError("");
  };

  const handleFiltersChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const actions = [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Store Owner Dashboard</h2>
        <div className="header-controls">
          <div className="tab-buttons">
            <Button
              variant={activeTab === "products" ? "primary" : "secondary"}
              onClick={() => setActiveTab("products")}
              data-variant={activeTab === "products" ? "primary" : "secondary"}
            >
              Browse Products
            </Button>
            <Button
              variant={activeTab === "orders" ? "primary" : "secondary"}
              onClick={() => setActiveTab("orders")}
              data-variant={activeTab === "orders" ? "primary" : "secondary"}
            >
              My Orders
            </Button>
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

             {activeTab === "products" && (
         <div>
           <TableWithGlobalSearch
             columns={columns}
             data={products}
             searchFields={["name", "description"]}
             filters={getFilters(filterOptions)}
             actions={actions}
             loading={loading}
             selectedFilters={selectedFilters}
             onFiltersChange={handleFiltersChange}
           />
         </div>
       )}

      {activeTab === "orders" && (
        <div>
          <h3>My Orders</h3>
          <p>Track the status of your orders with the admin.</p>
          <TableWithGlobalSearch
            columns={orderColumns}
            data={orders}
            searchFields={["orderNumber", "productName"]}
            filters={orderFilters}
            actions={actions}
            loading={loading}
            selectedFilters={selectedFilters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      )}

      <Modal
        isOpen={showOrderModal}
        onClose={handleCloseModal}
        title="Place Order"
      >
        <form onSubmit={handleSubmitOrder}>
          <InputField
            label="Product"
            value={orderFormData.productName}
            disabled
            placeholder="Product name"
          />

          <InputField
            label="Quantity"
            type="number"
            value={orderFormData.quantity}
            onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
            min="1"
            required
            placeholder="Enter quantity"
          />

          <InputField
            label="Notes"
            value={orderFormData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            type="textarea"
            placeholder="Any special requirements or notes"
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
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 