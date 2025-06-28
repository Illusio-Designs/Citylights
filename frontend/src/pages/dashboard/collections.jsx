import React, { useState, useEffect } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';
import { adminCollectionService } from '../../services/adminService';

const columns = [
  {
    header: 'Image',
    accessor: 'image',
    cell: ({ image }) =>
      image ? (
        <img
          src={image.startsWith('http') ? image : `/api/uploads/collections/${image}`}
          alt="Collection"
          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
        />
      ) : (
        <span style={{ color: '#aaa' }}>No Image</span>
      ),
    width: '70px',
    align: 'center',
  },
  { accessor: 'name', header: 'Name' },
  { accessor: 'description', header: 'Description' },
  {
    accessor: 'status',
    header: 'Status',
    cell: ({ status }) => {
      const value = (status || '').toLowerCase();
      const color = value === 'active' ? 'green' : value === 'inactive' ? 'red' : '#888';
      return (
        <span style={{
          color,
          fontWeight: 500,
          textTransform: 'capitalize'
        }}>
          {status}
        </span>
      );
    }
  },
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
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminCollectionService.getCollections();
      setCollections(res.data);
    } catch (err) {
      setError('Failed to fetch collections');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleAddCollection = () => {
    setSelectedCollection(null);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      image: null
    });
    setShowModal(true);
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description,
      status: collection.status,
      image: collection.image
    });
    setShowModal(true);
  };

  const handleDeleteCollection = async (collection) => {
    setLoading(true);
    setError('');
    try {
      await adminCollectionService.deleteCollection(collection.id);
      fetchCollections();
    } catch (err) {
      setError('Failed to delete collection');
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (selectedCollection) {
        await adminCollectionService.updateCollection(selectedCollection.id, formData);
      } else {
        await adminCollectionService.createCollection(formData);
      }
      setShowModal(false);
      fetchCollections();
    } catch (err) {
      setError('Failed to save collection');
    }
    setLoading(false);
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
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <TableWithControls
        columns={columns}
        data={collections}
        searchFields={['name', 'description']}
        filters={filters}
        actions={actions}
        loading={loading}
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
          <div style={{ marginBottom: 16 }}>
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {formData.image && (
              <div style={{ marginTop: 8 }}>
                <img src={URL.createObjectURL(formData.image)} alt="Preview" style={{ maxWidth: 100, maxHeight: 100 }} />
              </div>
            )}
          </div>
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
              disabled={loading}
            >
              {selectedCollection ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 