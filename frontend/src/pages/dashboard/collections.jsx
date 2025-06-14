import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockCollections = [
  { id: 1, name: 'Summer Collection', description: 'Summer fashion items', status: 'Active' },
  { id: 2, name: 'Winter Collection', description: 'Winter fashion items', status: 'Active' },
  { id: 3, name: 'Spring Collection', description: 'Spring fashion items', status: 'Inactive' },
];

const columns = [
  { accessor: 'name', header: 'Name' },
  { accessor: 'description', header: 'Description' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Active', label: 'Active' }, 
    { value: 'Inactive', label: 'Inactive' } 
  ] },
];

export default function CollectionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState(mockCollections);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  });

  const handleAddCollection = () => {
    setSelectedCollection(null);
    setFormData({
      name: '',
      description: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description,
      status: collection.status
    });
    setShowModal(true);
  };

  const handleDeleteCollection = (collection) => {
    setCollections(collections.filter(c => c.id !== collection.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCollection) {
      // Update existing collection
      setCollections(collections.map(c => 
        c.id === selectedCollection.id ? { ...c, ...formData } : c
      ));
    } else {
      // Add new collection
      const newCollection = {
        id: collections.length + 1,
        ...formData
      };
      setCollections([...collections, newCollection]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditCollection },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteCollection },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Collections Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddCollection}>Add Collection</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={collections}
        searchFields={['name', 'description']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedCollection ? 'Edit Collection' : 'Add Collection'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Name" 
            value={formData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            required
          />
          <InputField 
            label="Description" 
            value={formData.description} 
            onChange={(e) => handleInputChange('description', e.target.value)} 
            multiline
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
              {selectedCollection ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 