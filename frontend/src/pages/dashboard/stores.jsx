import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockStores = [
  { id: 1, name: 'Main Store', location: 'New York', status: 'Active' },
  { id: 2, name: 'Branch Store', location: 'Los Angeles', status: 'Active' },
  { id: 3, name: 'Outlet Store', location: 'Chicago', status: 'Inactive' },
];

const columns = [
  { accessor: 'name', header: 'Store Name' },
  { accessor: 'location', header: 'Location' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'status', label: 'Status', options: [ { value: '', label: 'All Status' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' } ] },
];

export default function StoresPage() {
  const [showModal, setShowModal] = useState(false);
  const [stores, setStores] = useState(mockStores);
  const [selectedStore, setSelectedStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'Active'
  });

  const handleAddStore = () => {
    setSelectedStore(null);
    setFormData({
      name: '',
      location: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      location: store.location,
      status: store.status
    });
    setShowModal(true);
  };

  const handleDeleteStore = (store) => {
    setStores(stores.filter(s => s.id !== store.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStore) {
      // Update existing store
      setStores(stores.map(s => 
        s.id === selectedStore.id ? { ...s, ...formData } : s
      ));
    } else {
      // Add new store
      const newStore = {
        id: stores.length + 1,
        ...formData
      };
      setStores([...stores, newStore]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditStore },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteStore },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Stores Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddStore}>Add Store</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={stores}
        searchFields={['name', 'location']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedStore ? 'Edit Store' : 'Add Store'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Store Name" 
            value={formData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            required
          />
          <InputField 
            label="Location" 
            value={formData.location} 
            onChange={(e) => handleInputChange('location', e.target.value)} 
            required
          />
          <InputField 
            label="Status" 
            type="select"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' }
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
              {selectedStore ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 