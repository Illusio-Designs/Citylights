import React from 'react';
import '../../styles/common/Filter.css';
import DropdownSelect from './DropdownSelect';

const Filter = ({ filters = [], selectedFilters = {}, onChange }) => {
  return (
    <div className="filter-container">
      {filters.map(filter => (
        <div key={filter.key} className="filter-item">
          <DropdownSelect
            label={filter.label}
            options={filter.options}
            value={selectedFilters[filter.key] || ''}
            onChange={option => onChange(filter.key, option ? option.value : '')}
            placeholder={filter.placeholder || `Select ${filter.label}`}
          />
        </div>
      ))}
    </div>
  );
};

export default Filter; 