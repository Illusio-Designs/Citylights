import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { adminProductService, adminCollectionService } from '../../services/adminService';

const BulkProductUpload = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      const response = await adminCollectionService.getCollections();
      setCollections(response.data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('Excel file is empty');
          return;
        }

        // Validate required columns
        const requiredColumns = ['Product Name', 'Collection Name', 'Slug', 'SKU'];
        const firstRow = jsonData[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Validate collection names
        const validationErrors = [];
        const validCollectionNames = collections.map(c => c.name.toLowerCase());
        
        jsonData.forEach((row, index) => {
          const collectionName = row['Collection Name']?.toString().trim().toLowerCase();
          if (collectionName && !validCollectionNames.includes(collectionName)) {
            validationErrors.push(`Row ${index + 1}: Collection Name "${row['Collection Name']}" does not exist`);
          }
        });

        if (validationErrors.length > 0) {
          toast.error(`Validation errors found:\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? '\n...and more' : ''}`);
          return;
        }

        setParsedData(jsonData);
        toast.success(`Parsed ${jsonData.length} products from Excel file`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Error parsing Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processProductData = (rowData) => {
    // Convert Excel row to product format
    const collectionName = rowData['Collection Name']?.trim();
    
    // Find collection by name (case insensitive)
    const collection = collections.find(c => 
      c.name.toLowerCase() === collectionName.toLowerCase()
    );
    
    if (!collection) {
      throw new Error(`Collection "${collectionName}" does not exist. Available collections: ${collections.map(c => c.name).join(', ')}`);
    }

    const product = {
      name: rowData['Product Name']?.trim(),
      description: rowData['Description']?.trim() || '',
      collection_id: collection.id, // Use the found collection's ID
      slug: rowData['Slug']?.trim(),
      meta_title: rowData['Meta Title']?.trim() || '',
      meta_desc: rowData['Meta Description']?.trim() || '',
      variations: [{
        sku: rowData['SKU']?.trim(),
        price: rowData['Price'] ? parseFloat(rowData['Price']) : null,
        usecase: rowData['Use Case']?.trim() || '',
        attributes: []
      }]
    };

    // Process attributes dynamically
    const attributeColumns = [
      'Power Options', 'Cutout Size', 'Outer Diameter', 'Height', 
      'Body Color', 'Color Temperature', 'Beam Angle', 'Luminous Efficacy',
      'Material', 'CRI', 'Power Factor', 'Input Voltage'
    ];

    attributeColumns.forEach(column => {
      if (rowData[column] && rowData[column].toString().trim()) {
        product.variations[0].attributes.push({
          name: column,
          value: rowData[column].toString().trim()
        });
      }
    });

    return product;
  };

  const handleBulkUpload = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalProducts = parsedData.length;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < totalProducts; i++) {
        try {
          const productData = processProductData(parsedData[i]);
          
          // Create FormData for the product
          const formData = new FormData();
          formData.append('name', productData.name);
          formData.append('description', productData.description);
          formData.append('collection_id', productData.collection_id);
          formData.append('slug', productData.slug);
          formData.append('meta_title', productData.meta_title);
          formData.append('meta_desc', productData.meta_desc);
          formData.append('variations', JSON.stringify(productData.variations));

          await adminProductService.createProduct(formData);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Row ${i + 1} (${parsedData[i]['Product Name']}): ${error.message}`);
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalProducts) * 100));
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} products`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} products`);
        console.error('Upload errors:', errors);
      }

      if (successCount > 0 && onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Bulk upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setUploadProgress(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Product Upload">
      <div className="bulk-upload-container">
        <div className="file-upload-section">
          <h4>Upload Excel File:</h4>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ marginBottom: '20px' }}
          />
          
          {file && (
            <div className="file-info">
              <p>Selected file: <strong>{file.name}</strong></p>
              <p>Parsed products: <strong>{parsedData.length}</strong></p>
            </div>
          )}
        </div>

        {parsedData.length > 0 && (
          <div className="preview-section">
            <h4>Preview (First 3 products):</h4>
            <div className="preview-table">
              <table style={{ width: '100%', fontSize: '12px', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Collection Name</th>
                    <th>Price</th>
                    <th>Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 3).map((row, index) => (
                    <tr key={index}>
                      <td>{row['Product Name']}</td>
                      <td>{row['SKU']}</td>
                      <td>{row['Collection Name']}</td>
                      <td>{row['Price']}</td>
                      <td>{row['Use Case']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        )}

        <div className="modal-actions">
          <Button 
            onClick={resetForm} 
            variant="outline"
            disabled={isUploading}
          >
            Reset
          </Button>
          <Button 
            onClick={handleBulkUpload}
            disabled={parsedData.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload ${parsedData.length} Products`}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .bulk-upload-container {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .file-upload-section h4 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .file-info {
          background: #e8f5e8;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
        }
        
        .file-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .preview-section {
          margin: 20px 0;
        }
        
        .preview-table table {
          border-collapse: collapse;
          border: 1px solid #ddd;
        }
        
        .preview-table th,
        .preview-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .preview-table th {
          background: #f5f5f5;
          font-weight: 600;
        }
        
        .upload-progress {
          margin: 20px 0;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }
        
        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
      `}</style>
    </Modal>
  );
};

export default BulkProductUpload;