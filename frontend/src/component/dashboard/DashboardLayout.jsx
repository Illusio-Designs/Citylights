import React, { useState, createContext, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
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
  ShoppingCart,
  FileText,
  User,
  LogOut,
  Presentation,
  MessageSquare,
  Phone,
  Calendar,
  HelpCircle,
  Search,
  Maximize,
  Minimize,
  Menu,
  X,
} from "lucide-react";

// Helper to check if user is a store owner
const getIsStoreOwner = () => Boolean(localStorage.getItem("store_owner_id"));

// Create a context for global search
const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

const AdminSidebarLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Collections", path: "/dashboard/collections", icon: Layers },
  { name: "Products", path: "/dashboard/products", icon: Package },
  { name: "Orders", path: "/dashboard/orders", icon: ShoppingCart },
  { name: "Reviews", path: "/dashboard/reviews", icon: Star },
  { name: "Slider", path: "/dashboard/slider", icon: Presentation },
  { name: "Stores", path: "/dashboard/stores", icon: Store },
  { name: "Users", path: "/dashboard/users", icon: Users },
  { name: "Contacts", path: "/dashboard/contacts", icon: MessageSquare },
  { name: "Phone Leads", path: "/dashboard/phone", icon: Phone },
  { name: "Appointments", path: "/dashboard/appointments", icon: Calendar },
  { name: "Help Requests", path: "/dashboard/help", icon: HelpCircle },
  { name: "SEO", path: "/dashboard/seo", icon: FileText },
];

const StoreOwnerSidebarLinks = [
  { name: "Store Dashboard", path: "/dashboard/store-owner", icon: LayoutDashboard },
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Mobile drawer state (the sidebar is an off-canvas drawer below 900px)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isStoreOwner = getIsStoreOwner();

  // Reset search when navigating to a different page
  useEffect(() => {
    setGlobalSearchTerm("");
    // Close the mobile drawer and profile menu after navigating
    setMobileNavOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Close the drawer with Escape and lock body scroll while it is open
  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  // Close the profile menu when clicking anywhere outside of it
  useEffect(() => {
    if (!showProfileMenu) return undefined;
    const onPointerDown = (e) => {
      if (!e.target.closest(".profile-menu")) setShowProfileMenu(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showProfileMenu]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    // Clear store owner data if exists
    localStorage.removeItem("store_owner_id");
    localStorage.removeItem("store_owner_name");
    localStorage.removeItem("store_owner_email");
    navigate("/dashboard/login", { replace: true });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const searchContextValue = {
    searchTerm: globalSearchTerm,
    setSearchTerm: setGlobalSearchTerm,
  };

  return (
    <SearchContext.Provider value={searchContextValue}>
      <div
        className={`dashboard-layout${collapsed ? " collapsed" : ""}${
          mobileNavOpen ? " mobile-nav-open" : ""
        }`}
      >
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
        <aside className="dashboard-sidebar" id="dashboard-sidebar">
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
            <div className="header-left">
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => setMobileNavOpen((o) => !o)}
                aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileNavOpen}
                aria-controls="dashboard-sidebar"
              >
                {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <span className="header-title">{isStoreOwner ? "Store Owner Dashboard" : "Admin Dashboard"}</span>
            </div>
            <div className="header-right">
              <div className="global-search">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="global-search-input"
                  aria-label="Search"
                />
              </div>
              <button
                className="fullscreen-toggle"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <div className="profile-menu">
                <button
                  className="profile-trigger"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Account menu"
                  aria-expanded={showProfileMenu}
                >
                  <User size={24} />
                  <span className="admin-name">
                    {isStoreOwner ? localStorage.getItem("store_owner_name") || "Store Owner" : "Admin"}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="dashboard-content"><Outlet /></main>
          <footer className="dashboard-footer">
            &copy; 2024 Vivera Lighting Admin
          </footer>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
