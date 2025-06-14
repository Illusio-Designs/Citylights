import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';
import DropdownSelect from '../../component/common/DropdownSelect';

const mockOrders = [
  { id: 1, orderNumber: 'ORD-001', customer: 'John Doe', total: 299.99, status: 'Pending' },
  { id: 2, orderNumber: 'ORD-002', customer: 'Jane Smith', total: 199.99, status: 'Completed' },
  { id: 3, orderNumber: 'ORD-003', customer: 'Bob Johnson', total: 499.99, status: 'Processing' },
];

const columns = [
  { accessor: 'orderNumber', header: 'Order Number' },
  { accessor: 'customer', header: 'Customer' },
  { accessor: 'total', header: 'Total', cell: ({ total }) => `$${total}` },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Pending', label: 'Pending' }, 
    { value: 'Processing', label: 'Processing' }, 
    { value: 'Completed', label: 'Completed' } 
  ] },
];

export default function OrdersPage() {
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderNumber: '',
    customer: '',
    total: '',
    status: 'Pending'
  });

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setFormData({
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customer: '',
      total: '',
      status: 'Pending'
    });
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      orderNumber: order.orderNumber,
      customer: order.customer,
      total: order.total,
      status: order.status
    });
    setShowModal(true);
  };

  const handleDeleteOrder = (order) => {
    setOrders(orders.filter(o => o.id !== order.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOrder) {
      // Update existing order
      setOrders(orders.map(o => 
        o.id === selectedOrder.id ? { ...o, ...formData } : o
      ));
    } else {
      // Add new order
      const newOrder = {
        id: orders.length + 1,
        ...formData
      };
      setOrders([...orders, newOrder]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditOrder },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteOrder },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Orders Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddOrder}>Add Order</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={orders}
        searchFields={['orderNumber', 'customer']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedOrder ? 'Edit Order' : 'Add Order'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Order Number" 
            value={formData.orderNumber} 
            onChange={(e) => handleInputChange('orderNumber', e.target.value)} 
            required
            disabled
          />
          <InputField 
            label="Customer" 
            value={formData.customer} 
            onChange={(e) => handleInputChange('customer', e.target.value)} 
            required
          />
          <InputField 
            label="Total" 
            value={formData.total} 
            onChange={(e) => handleInputChange('total', e.target.value)} 
            type="number"
            required
          />
          <InputField 
            label="Status" 
            type="select"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Processing', label: 'Processing' },
              { value: 'Completed', label: 'Completed' }
            ]}
            required
          />
          <div className="modal-actions">
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              {selectedOrder ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 