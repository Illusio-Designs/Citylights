import React, { useState } from 'react';
import TableWithControls from '../../component/common/TableWithControls';
import Button from '../../component/common/Button';
import Modal from '../../component/common/Modal';
import InputField from '../../component/common/InputField';
import ActionButton from '../../component/common/ActionButton';

const mockProducts = [
  { id: 1, name: 'Product A', category: 'Electronics', price: 99.99, stock: 100, status: 'Active' },
  { id: 2, name: 'Product B', category: 'Books', price: 19.99, stock: 50, status: 'Inactive' },
  { id: 3, name: 'Product C', category: 'Clothing', price: 49.99, stock: 75, status: 'Active' },
];

const columns = [
  { accessor: 'name', header: 'Product Name' },
  { accessor: 'category', header: 'Category' },
  { accessor: 'price', header: 'Price', cell: ({ price }) => `$${price}` },
  { accessor: 'stock', header: 'Stock' },
  { accessor: 'status', header: 'Status' },
];

const filters = [
  { key: 'category', label: 'Category', options: [ 
    { value: '', label: 'All Categories' }, 
    { value: 'Electronics', label: 'Electronics' }, 
    { value: 'Books', label: 'Books' }, 
    { value: 'Clothing', label: 'Clothing' } 
  ] },
  { key: 'status', label: 'Status', options: [ 
    { value: '', label: 'All Status' }, 
    { value: 'Active', label: 'Active' }, 
    { value: 'Inactive', label: 'Inactive' } 
  ] },
];

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    status: 'Active'
  });

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      category: 'Electronics',
      price: '',
      stock: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status
    });
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    setProducts(products.filter(p => p.id !== product.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, ...formData } : p
      ));
    } else {
      // Add new product
      const newProduct = {
        id: products.length + 1,
        ...formData
      };
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
  };

  const actions = [
    { variant: 'edit', tooltip: 'Edit', onClick: handleEditProduct },
    { variant: 'delete', tooltip: 'Delete', onClick: handleDeleteProduct },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Products Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>
      </div>
      <TableWithControls
        columns={columns}
        data={products}
        searchFields={['name', 'category']}
        filters={filters}
        actions={actions}
      />
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Product Name" 
            value={formData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            required
          />
          <InputField 
            label="Category" 
            type="select"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={[
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Books', label: 'Books' },
              { value: 'Clothing', label: 'Clothing' }
            ]}
            required
          />
          <InputField 
            label="Price" 
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
            required
            min="0"
            step="0.01"
          />
          <InputField 
            label="Stock" 
            type="number"
            value={formData.stock}
            onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
            required
            min="0"
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
              {selectedProduct ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 