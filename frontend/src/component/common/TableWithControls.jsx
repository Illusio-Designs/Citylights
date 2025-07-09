import React, { useState, useEffect } from "react";
import Table from "./Table";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import Filter from "./Filter";
import ActionButton from "./ActionButton";
import "../../styles/common/TableControls.css";

const TableWithControls = ({
  columns,
  data,
  itemsPerPage = 10,
  searchFields = [],
  filters = [],
  actions = [],
  onRowClick,
  className = '',
  selectedFilters = {},
  onFiltersChange = () => {},
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Combined effect to handle data changes, filtering, and searching
  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let result = [...data];

    // Apply search
    if (searchTerm && Array.isArray(searchFields) && searchFields.length > 0) {
      result = result.filter((item) =>
        searchFields.some(
          (field) =>
            field &&
            item &&
            item[field] &&
            String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // No local filtering, backend handles it

    setFilteredData(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [data, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const renderActions = (row) => {
    return (
      <div className="action-buttons">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            variant={action.variant}
            icon={action.icon}
            onClick={() => action.onClick(row)}
            tooltip={action.tooltip}
            disabled={action.disabled?.(row)}
            size={action.size || "small"}
          />
        ))}
      </div>
    );
  };

  // Add serial number column and actions column if needed
  const enhancedColumns = [
    {
      key: "serial",
      header: "S.No.",
      render: (row) => {
        // Calculate the actual index in the filtered data
        const actualIndex = filteredData.findIndex((item) => item === row);
        return actualIndex + 1;
      },
      width: "80px",
      align: "center",
    },
    ...columns,
    ...(actions?.length > 0
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (row) => renderActions(row),
            width: "120px",
            align: "center",
          },
        ]
      : []),
  ];

  return (
    <div className={`table-with-controls ${className}`}>
      <div className="table-controls">
        <div className="controls-left">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search..."
          />
        </div>
        <div className="controls-right">
          <Filter
            filters={filters}
            selectedFilters={selectedFilters}
            onChange={onFiltersChange}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span>Loading...</span>
        </div>
      ) : (
        <Table
          columns={enhancedColumns}
          data={paginatedData}
          onRowClick={onRowClick}
        />
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default TableWithControls; 