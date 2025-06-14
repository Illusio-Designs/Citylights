import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
];

const columns = [
  { accessor: 'name', header: 'Name' },
  { accessor: 'email', header: 'Email' },
  { accessor: 'role', header: 'Role' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'role', label: 'Role', options: [ 
    { value: '', label: 'All Roles' }, 
    { value: 'Admin', label: 'Admin' }, 
    { value: 'Manager', label: 'Manager' }, 
    { value: 'User', label: 'User' } 
  ] },
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Active', label: 'Active' }, 
    { value: 'Inactive', label: 'Inactive' } 
  ] },
];

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    status: 'Active'
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'User',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setUsers(users.filter(u => u.id !== user.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, ...formData } : u
      ));
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...formData
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditUser },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteUser },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Users Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={users}
        searchFields={['name', 'email']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedUser ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Name" 
            value={formData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            required
          />
          <InputField 
            label="Email" 
            value={formData.email} 
            onChange={(e) => handleInputChange('email', e.target.value)} 
            type="email"
            required
          />
          <InputField 
            label="Role" 
            type="select"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Manager', label: 'Manager' },
              { value: 'User', label: 'User' }
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
              {selectedUser ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 