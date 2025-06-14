import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockSettings = [
  { id: 1, name: 'Store Name', value: 'My Store', category: 'General', status: 'Active' },
  { id: 2, name: 'Currency', value: 'USD', category: 'General', status: 'Active' },
  { id: 3, name: 'Tax Rate', value: '10%', category: 'Tax', status: 'Active' },
];

const columns = [
  { accessor: 'name', header: 'Setting Name' },
  { accessor: 'value', header: 'Value' },
  { accessor: 'category', header: 'Category' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'category', label: 'Category', options: [ 
    { value: '', label: 'All Categories' }, 
    { value: 'General', label: 'General' }, 
    { value: 'Tax', label: 'Tax' }, 
    { value: 'Shipping', label: 'Shipping' } 
  ] },
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Active', label: 'Active' }, 
    { value: 'Inactive', label: 'Inactive' } 
  ] },
];

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState(mockSettings);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    category: 'General',
    status: 'Active'
  });

  const handleAddSetting = () => {
    setSelectedSetting(null);
    setFormData({
      name: '',
      value: '',
      category: 'General',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setFormData({
      name: setting.name,
      value: setting.value,
      category: setting.category,
      status: setting.status
    });
    setShowModal(true);
  };

  const handleDeleteSetting = (setting) => {
    setSettings(settings.filter(s => s.id !== setting.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSetting) {
      // Update existing setting
      setSettings(settings.map(s => 
        s.id === selectedSetting.id ? { ...s, ...formData } : s
      ));
    } else {
      // Add new setting
      const newSetting = {
        id: settings.length + 1,
        ...formData
      };
      setSettings([...settings, newSetting]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditSetting },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteSetting },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Settings Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddSetting}>Add Setting</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={settings}
        searchFields={['name', 'value', 'category']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedSetting ? 'Edit Setting' : 'Add Setting'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Setting Name" 
            value={formData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            required
          />
          <InputField 
            label="Value" 
            value={formData.value} 
            onChange={(e) => handleInputChange('value', e.target.value)} 
            required
          />
          <InputField 
            label="Category" 
            type="select"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={[
              { value: 'General', label: 'General' },
              { value: 'Tax', label: 'Tax' },
              { value: 'Shipping', label: 'Shipping' }
            ]}
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
              {selectedSetting ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 