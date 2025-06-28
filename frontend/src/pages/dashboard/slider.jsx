import React from "react";
import { Search } from "lucide-react";
import Table from "../../component/common/Table";
import Button from "../../component/common/Button";
import ActionButton from "../../component/common/ActionButton";
import "../../styles/dashboard/management.css";

const SliderManagement = () => {
  const sliders = [
    {
      id: 1,
      image: "https://via.placeholder.com/80x40.png/FFC0CB/000000?text=Fashion",
      title: "Hot Deals",
      description: "Comfortable and breathable cotton socks",
      category: "Fashion Socks",
      status: "active",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/80x40.png/AFAFAF/000000?text=Sports",
      title: "New Arrivals",
      description: "Introducing our latest collection of woolen Socks.",
      category: "Sports Socks",
      status: "active",
    },
  ];

  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      Cell: ({ cell: { value } }) => <div className="s-n">{value}</div>,
    },
    {
      Header: "Image",
      accessor: "image",
      Cell: ({ cell: { value } }) => (
        <div className="image-cell">
          <img src={value} alt="slider" />
        </div>
      ),
    },
    { Header: "Title", accessor: "title" },
    { Header: "Description", accessor: "description" },
    { Header: "Category", accessor: "category" },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ cell: { value } }) => (
        <div className="status-cell">
          <span className={`status ${value}`}>{value}</span>
        </div>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: () => (
        <div className="actions-buttons">
          <ActionButton>Edit</ActionButton>
          <ActionButton>Delete</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="management-page">
      <div className="management-container">
        <div className="management-header">
          <h1 className="title">Slider Management</h1>
          <div className="controls">
            <div className="search-bar-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search"
                className="search-input"
              />
            </div>
            <Button variant="primary">Add New Slider</Button>
          </div>
        </div>
        <Table columns={columns} data={sliders} />
      </div>
    </div>
  );
};

export default SliderManagement;
