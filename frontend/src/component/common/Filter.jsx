import React from 'react';
import PropTypes from 'prop-types';

const Filter = ({ filters, onFilterChange, onSearch }) => {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              {filter.label}:
            </label>
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

Filter.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default Filter; 