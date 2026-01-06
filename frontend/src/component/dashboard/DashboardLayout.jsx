import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from '../../assets/Vivera Final Logo white.webp';
import smalllogo from '../../../public/vivera icon jpj.jpg';
import "./DashboardLayout.css";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Store,
  Star,
  Settings,
  ShoppingCart,
  FileText,
  User,
  Bell,
  LogOut,
  Presentation,
  Image,
  Palette,
  BarChart3,
} from "lucide-react";

// Helper to check if user is a store owner
const getIsStoreOwner = () => Boolean(localStorage.getItem("store_owner_id"));

const AdminSidebarLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Collections", path: "/dashboard/collections", icon: Layers },
  { name: "Products", path: "/dashboard/products", icon: Package },
  { name: "Orders", path: "/dashboard/orders", icon: ShoppingCart },
  { name: "Reviews", path: "/dashboard/reviews", icon: Star },
  { name: "Slider", path: "/dashboard/slider", icon: Presentation },
  { name: "Stores", path: "/dashboard/stores", icon: Store },
  { name: "Users", path: "/dashboard/users", icon: Users },
  { name: "SEO", path: "/dashboard/seo", icon: FileText },
];

const StoreOwnerSidebarLinks = [
  { name: "Store Dashboard", path: "/dashboard/store-owner", icon: LayoutDashboard },
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isStoreOwner = getIsStoreOwner();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    // Clear store owner data if exists
    localStorage.removeItem("store_owner_id");
    localStorage.removeItem("store_owner_name");
    localStorage.removeItem("store_owner_email");
    navigate("/dashboard/login", { replace: true });
  };

  return (
    <div className={`dashboard-layout${collapsed ? " collapsed" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src={collapsed ? smalllogo : logo} alt="Logo" />
        </div>
        <nav>
          <ul>
            {(isStoreOwner ? StoreOwnerSidebarLinks : AdminSidebarLinks).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link to={link.path} className={isActive ? "active" : ""}>
                    <Icon size={20} className="sidebar-icon" />
                    <span className="link-text">{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <button
        className="sidebar-toggle-btn"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle sidebar"
      >
        <div className={`toggle-arrow ${collapsed ? "collapsed" : ""}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <span>{isStoreOwner ? "Store Owner Dashboard" : "Admin Dashboard"}</span>
          <div className="profile-menu">
            <button
              className="profile-trigger"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User size={24} />
              <span className="admin-name">
                {isStoreOwner ? localStorage.getItem("store_owner_name") || "Store Owner" : "Admin"}
              </span>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/dashboard/profile" className="dropdown-item">
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <Link to="/dashboard/notifications" className="dropdown-item">
                  <Bell size={18} />
                  <span>Notifications</span>
                </Link>
                <Link to="/dashboard/settings" className="dropdown-item">
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
        <footer className="dashboard-footer">
          &copy; 2024 Citylights Admin
        </footer>
      </div>
    </div>
  );
}
