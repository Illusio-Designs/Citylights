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
import AuthPage from "./Authpage";
import "../../styles/dashboard/index.css";

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

function isAuthenticated() {
  // Check for admin API key/token in localStorage
  return Boolean(localStorage.getItem("admin_token"));
}

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
                      <div className="dashboard-page">
                        <h2>Welcome to the Admin Dashboard</h2>
                        <div className="content-wrapper">
                          <p>
                            Select a section from the sidebar to manage your
                            data.
                          </p>
                        </div>
                      </div>
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
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
