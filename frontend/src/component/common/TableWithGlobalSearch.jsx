import React, { useState, useEffect, useRef, useMemo } from "react";
import Table from "./Table";
import Pagination from "./Pagination";
import Filter from "./Filter";
import ActionButton from "./ActionButton";
import { useSearch } from "../../hooks/useSearch";
import "../../styles/common/TableControls.css";

const TableWithGlobalSearch = ({
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
  const [filteredData, setFilteredData] = useState([]);
  const { searchTerm } = useSearch();

  // Use refs to track previous values and avoid resetting page on every render
  const prevSearchTerm = useRef(searchTerm);
  const prevFilters = useRef(JSON.stringify(selectedFilters));

  // Stable serialized filters string - only changes when filter values actually change
  const filtersStr = useMemo(() => JSON.stringify(selectedFilters), [selectedFilters]);

  // Reset page only when search or filter values actually change
  useEffect(() => {
    if (prevSearchTerm.current !== searchTerm || prevFilters.current !== filtersStr) {
      prevSearchTerm.current = searchTerm;
      prevFilters.current = filtersStr;
      setCurrentPage(1);
    }
  }, [searchTerm, filtersStr]);

  // Filter and search data - use filtersStr (stable) instead of selectedFilters object
  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    const filters = JSON.parse(filtersStr);
    let result = [...data];

    if (filters && Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([filterKey, filterValue]) => {
          if (!filterValue || filterValue === '') return true;

          if (filterKey === 'collection') {
            const collectionName = item.Collection?.name || item.collection_name || '';
            return collectionName.toLowerCase() === filterValue.toLowerCase();
          }

          const itemValue = item[filterKey];
          if (itemValue === undefined || itemValue === null) return false;
          return String(itemValue).toLowerCase() === String(filterValue).toLowerCase();
        });
      });
    }

    if (searchTerm && Array.isArray(searchFields) && searchFields.length > 0) {
      result = result.filter((item) =>
        searchFields.some(
          (field) =>
            field && item && item[field] &&
            String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredData(result);
  }, [data, searchTerm, searchFields, filtersStr]);

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
        const indexInPage = paginatedData.findIndex((item) => item === row);
        return startIndex + indexInPage + 1;
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

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(totalPages, 1)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default TableWithGlobalSearch;