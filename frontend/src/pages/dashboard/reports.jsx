import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockReports = [
  { id: 1, title: 'Sales Report', type: 'Sales', date: '2024-03-15', status: 'Completed' },
  { id: 2, title: 'Inventory Report', type: 'Inventory', date: '2024-03-14', status: 'Pending' },
  { id: 3, title: 'Customer Report', type: 'Customer', date: '2024-03-13', status: 'Failed' },
];

const columns = [
  { accessor: 'title', header: 'Title' },
  { accessor: 'type', header: 'Type' },
  { accessor: 'date', header: 'Date' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'type', label: 'Type', options: [ 
    { value: '', label: 'All Types' }, 
    { value: 'Sales', label: 'Sales' }, 
    { value: 'Inventory', label: 'Inventory' }, 
    { value: 'Customer', label: 'Customer' } 
  ] },
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Completed', label: 'Completed' }, 
    { value: 'Pending', label: 'Pending' }, 
    { value: 'Failed', label: 'Failed' } 
  ] },
];

export default function ReportsPage() {
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Sales',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  const handleAddReport = () => {
    setSelectedReport(null);
    setFormData({
      title: '',
      type: 'Sales',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setShowModal(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setFormData({
      title: report.title,
      type: report.type,
      date: report.date,
      status: report.status
    });
    setShowModal(true);
  };

  const handleDeleteReport = (report) => {
    setReports(reports.filter(r => r.id !== report.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedReport) {
      // Update existing report
      setReports(reports.map(r => 
        r.id === selectedReport.id ? { ...r, ...formData } : r
      ));
    } else {
      // Add new report
      const newReport = {
        id: reports.length + 1,
        ...formData
      };
      setReports([...reports, newReport]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditReport },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteReport },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Reports Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddReport}>Generate Report</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={reports}
        searchFields={['title', 'type']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedReport ? 'Edit Report' : 'Generate Report'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Title" 
            value={formData.title} 
            onChange={(e) => handleInputChange('title', e.target.value)} 
            required
          />
          <InputField 
            label="Type" 
            type="select"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            options={[
              { value: 'Sales', label: 'Sales' },
              { value: 'Inventory', label: 'Inventory' },
              { value: 'Customer', label: 'Customer' }
            ]}
            required
          />
          <InputField 
            label="Date" 
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
          <InputField 
            label="Status" 
            type="select"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={[
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Failed', label: 'Failed' }
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
              {selectedReport ? 'Update' : 'Generate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 