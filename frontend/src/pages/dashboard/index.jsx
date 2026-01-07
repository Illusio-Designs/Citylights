import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
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
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
          }}
        />
      </div>
    );
  }

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
      <Route path="/login" element={<AuthPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route
                  path="/"
                  element={
                    <DashboardContent>
                      <DashboardMain />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <DashboardContent>
                      <Users />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <DashboardContent>
                      <Products />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/collections"
                  element={
                    <DashboardContent>
                      <Collections />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/stores"
                  element={
                    <DashboardContent>
                      <Stores />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <DashboardContent>
                      <Reviews />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/slider"
                  element={
                    <DashboardContent>
                      <SliderManagement />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/store-owner"
                  element={
                    <DashboardContent>
                      <StoreOwnerDashboard />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <DashboardContent>
                      <Orders />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/seo"
                  element={
                    <DashboardContent>
                      <SeoPage />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/contacts"
                  element={
                    <DashboardContent>
                      <ContactsDashboard />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/phone"
                  element={
                    <DashboardContent>
                      <PhoneDashboard />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <DashboardContent>
                      <AppointmentsDashboard />
                    </DashboardContent>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <DashboardContent>
                      <HelpDashboard />
                    </DashboardContent>
                  }
                />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
