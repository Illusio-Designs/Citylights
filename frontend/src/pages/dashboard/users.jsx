import React, { useState, useEffect } from "react";
import TableWithControls from "../../component/common/TableWithControls";
import Button from "../../component/common/Button";
import Modal from "../../component/common/Modal";
import InputField from "../../component/common/InputField";
import ActionButton from "../../component/common/ActionButton";
import { adminUserService } from "../../services/adminService";

const columns = [
  {
    header: "Profile",
    accessor: "profileImage",
    cell: ({ profileImage, fullName }) =>
      profileImage ? (
        <img
          src={`http://localhost:5001/uploads/profile/${profileImage}`}
          alt={fullName}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: "bold",
            color: "#666",
          }}
        >
          {fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      ),
    width: "60px",
    align: "center",
  },
  { accessor: "fullName", header: "Name" },
  { accessor: "email", header: "Email" },
  { accessor: "phoneNumber", header: "Phone" },
  {
    accessor: "userType",
    header: "Role",
    cell: ({ userType }) => (
      <span
        style={{
          color: userType === "admin" ? "#d32f2f" : "#1976d2",
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {userType}
      </span>
    ),
  },
  {
    accessor: "status",
    header: "Status",
    cell: ({ status }) => {
      const color =
        status === "active"
          ? "green"
          : status === "suspended"
          ? "orange"
          : "red";
      return (
        <span
          style={{
            color,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessor: "created_at",
    header: "Created",
    cell: ({ created_at }) =>
      created_at ? new Date(created_at).toLocaleDateString() : "-",
  },
];

const filters = [
  {
    key: "userType",
    label: "Role",
    options: [
      { value: "", label: "All Roles" },
      { value: "admin", label: "Admin" },
      { value: "storeowner", label: "Store Owner" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "deleted", label: "Deleted" },
    ],
  },
];

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    userType: "storeowner",
    profileImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminUserService.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      userType: "storeowner",
      profileImage: null,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: "",
      phoneNumber: user.phoneNumber || "",
      userType: user.userType,
      profileImage: null,
    });
    setImagePreview(
      user.profileImage
        ? `http://localhost:5001/uploads/profile/${user.profileImage}`
        : null
    );
    setShowModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(`Are you sure you want to delete "${user.fullName}"?`)
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await adminUserService.deleteUser(user.id);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Failed to delete user");
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (selectedUser) {
        await adminUserService.updateUser(selectedUser.id, formData);
      } else {
        await adminUserService.createUser(formData);
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.message || "Failed to save user");
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setImagePreview(null);
  };

  const actions = [
    { variant: "edit", tooltip: "Edit", onClick: handleEditUser },
    { variant: "delete", tooltip: "Delete", onClick: handleDeleteUser },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Users Management</h2>
        <div className="header-controls">
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#ffebee",
            borderRadius: 4,
            border: "1px solid #ffcdd2",
          }}
        >
          {error}
        </div>
      )}

      <TableWithControls
        columns={columns}
        data={users}
        searchFields={["fullName", "email"]}
        filters={filters}
        actions={actions}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedUser ? "Edit User" : "Add User"}
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            required
            placeholder="Enter full name"
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            type="email"
            required
            placeholder="Enter email address"
          />

          {!selectedUser && (
            <InputField
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              type="password"
              required
              placeholder="Enter password"
            />
          )}

          <InputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            placeholder="Enter phone number"
          />

          <InputField
            label="Role"
            type="select"
            value={formData.userType}
            onChange={(e) => handleInputChange("userType", e.target.value)}
            options={[
              { value: "admin", label: "Admin" },
              { value: "storeowner", label: "Store Owner" },
            ]}
            required
          />

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
            {selectedUser?.profileImage && !imagePreview && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  Current image:
                </p>
                <img
                  src={`http://localhost:5001/uploads/profile/${selectedUser.profileImage}`}
                  alt="Current"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                color: "red",
                marginBottom: 16,
                padding: 8,
                backgroundColor: "#ffebee",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              type="button"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : selectedUser ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
