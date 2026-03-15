import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import DashboardLayout from "../../component/dashboard/DashboardLayout";
import ProtectedRoute from "../../component/dashboard/ProtectedRoute";
import Loader from "../../component/Loader";
import Users from "./users";
import Products from "./products";
import Collections from "./collections";
import Stores from "./stores";
import Reviews from "./reviews";
import SliderManagement from "./slider";
import StoreOwnerDashboard from "./StoreOwnerDashboard";
import Orders from "./orders";
import SeoPage from "./seo";
import ContactsDashboard from "./contacts";
import PhoneDashboard from "./phone";
import AppointmentsDashboard from "./appointments";
import HelpDashboard from "./help";
import AuthPage from "./Authpage";
import "../../styles/dashboard/index.css";
import "../../styles/dashboard/stats.css";
import {
  adminProductService,
  adminStoreService,
  adminOrderService,
} from "../../services/adminService";

const DashboardContent = ({ children }) => {
  return children;
};

const StatsCards = () => {
  const [counts, setCounts] = useState({ products: null, stores: null, orders: null, pending: null, revenue: null });

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        const [prodRes, storeRes, orderRes] = await Promise.all([
          adminProductService.getProducts(),
          adminStoreService.getStores(),
          adminOrderService.getOrders(),
        ]);

        const products = prodRes?.data || [];
        const stores = storeRes?.data || storeRes || [];
        const orders = orderRes?.data?.data || orderRes?.data || [];

        const pending = orders.filter(o => o.status === 'pending').length;
        const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount || o.total_amount || 0) || 0), 0);

        const newCounts = {
          products: products.length,
          stores: stores.length,
          orders: orders.length,
          pending,
          revenue,
        };

        if (mounted) setCounts(newCounts);
      } catch (err) {
        console.error("Failed to fetch dashboard counts:", err);
        if (mounted) setCounts({ products: 0, stores: 0, orders: 0, pending: 0, revenue: 0 });
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // no external onLoaded used; cards show placeholders until counts populate

  const formatCurrency = (v) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);
    } catch {
      return `₹${(v||0).toFixed(2)}`;
    }
  };

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon products">P</div>
        <div className="stat-body">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{counts.products === null ? (
              <span className="dots"><span></span><span></span><span></span></span>
            ) : (
              <span className="count-animate">{counts.products}</span>
            )}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stores">S</div>
        <div className="stat-body">
          <div className="stat-label">Total Stores</div>
          <div className="stat-value">{counts.stores === null ? (
              <span className="dots"><span></span><span></span><span></span></span>
            ) : (
              <span className="count-animate">{counts.stores}</span>
            )}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon orders">O</div>
        <div className="stat-body">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{counts.orders === null ? (
              <span className="dots"><span></span><span></span><span></span></span>
            ) : (
              <span className="count-animate">{counts.orders}</span>
            )}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon revenue">₹</div>
        <div className="stat-body">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{counts.revenue === null ? (
              <span className="dots"><span></span><span></span><span></span></span>
            ) : (
              <span className="count-animate">{formatCurrency(counts.revenue)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardMain = () => {
  return (
    <div className="dashboard-page">
      <h2>Welcome to the Admin Dashboard</h2>
      <StatsCards />
    </div>
  );
};

// (auth handled by ProtectedRoute and adminService interceptors)

export default function DashboardHome() {
  return (
    <Routes>
      {/* Login route */}
      <Route path="login" element={<AuthPage />} />

      {/* Protected dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardMain />} />
        <Route path="users" element={<Users />} />
        <Route path="products" element={<Products />} />
        <Route path="collections" element={<Collections />} />
        <Route path="stores" element={<Stores />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="slider" element={<SliderManagement />} />
        <Route path="store-owner" element={<StoreOwnerDashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="contacts" element={<ContactsDashboard />} />
        <Route path="phone" element={<PhoneDashboard />} />
        <Route path="appointments" element={<AppointmentsDashboard />} />
        <Route path="help" element={<HelpDashboard />} />
      </Route>
    </Routes>
  );
}
