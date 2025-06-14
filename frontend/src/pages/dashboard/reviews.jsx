import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockReviews = [
  { id: 1, product: 'Product A', customer: 'John Doe', rating: 5, comment: 'Great product!', status: 'Approved' },
  { id: 2, product: 'Product B', customer: 'Jane Smith', rating: 4, comment: 'Good quality', status: 'Pending' },
  { id: 3, product: 'Product C', customer: 'Bob Johnson', rating: 3, comment: 'Average product', status: 'Rejected' },
];

const columns = [
  { accessor: 'product', header: 'Product' },
  { accessor: 'customer', header: 'Customer' },
  { accessor: 'rating', header: 'Rating', cell: ({ rating }) => `${rating}/5` },
  { accessor: 'comment', header: 'Comment' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Approved', label: 'Approved' }, 
    { value: 'Pending', label: 'Pending' }, 
    { value: 'Rejected', label: 'Rejected' } 
  ] },
  { key: 'rating', label: 'Rating', options: [ 
    { value: '', label: 'All Ratings' }, 
    { value: '5', label: '5 Stars' }, 
    { value: '4', label: '4 Stars' }, 
    { value: '3', label: '3 Stars' }, 
    { value: '2', label: '2 Stars' }, 
    { value: '1', label: '1 Star' } 
  ] },
];

export default function ReviewsPage() {
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState({
    product: '',
    customer: '',
    rating: 5,
    comment: '',
    status: 'Pending'
  });

  const handleAddReview = () => {
    setSelectedReview(null);
    setFormData({
      product: '',
      customer: '',
      rating: 5,
      comment: '',
      status: 'Pending'
    });
    setShowModal(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setFormData({
      product: review.product,
      customer: review.customer,
      rating: review.rating,
      comment: review.comment,
      status: review.status
    });
    setShowModal(true);
  };

  const handleDeleteReview = (review) => {
    setReviews(reviews.filter(r => r.id !== review.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedReview) {
      // Update existing review
      setReviews(reviews.map(r => 
        r.id === selectedReview.id ? { ...r, ...formData } : r
      ));
    } else {
      // Add new review
      const newReview = {
        id: reviews.length + 1,
        ...formData
      };
      setReviews([...reviews, newReview]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditReview },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteReview },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Reviews Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddReview}>Add Review</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={reviews}
        searchFields={['product', 'customer', 'comment']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedReview ? 'Edit Review' : 'Add Review'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Product" 
            value={formData.product} 
            onChange={(e) => handleInputChange('product', e.target.value)} 
            required
          />
          <InputField 
            label="Customer" 
            value={formData.customer} 
            onChange={(e) => handleInputChange('customer', e.target.value)} 
            required
          />
          <InputField 
            label="Rating" 
            type="select"
            value={formData.rating}
            onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
            options={[
              { value: '5', label: '5 Stars' },
              { value: '4', label: '4 Stars' },
              { value: '3', label: '3 Stars' },
              { value: '2', label: '2 Stars' },
              { value: '1', label: '1 Star' }
            ]}
            required
          />
          <InputField 
            label="Comment" 
            value={formData.comment} 
            onChange={(e) => handleInputChange('comment', e.target.value)} 
            multiline
            required
          />
          <InputField 
            label="Status" 
            type="select"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={[
              { value: 'Approved', label: 'Approved' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Rejected', label: 'Rejected' }
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
              {selectedReview ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 