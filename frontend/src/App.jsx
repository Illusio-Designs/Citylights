import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Productdetail from "./pages/Productdetail";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Collection from "./pages/Collection";
import Store from "./pages/Store";
import Aboutus from "./pages/Aboutus";
import StoreDetails from "./pages/StoreDetails";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import Loader from "./component/Loader";

// Dashboard Pages
import DashboardHome from "./pages/dashboard/index";

const PublicRoute = ({ children }) => {
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
    return <Loader />;
  }

  return children;
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Home />
              </PublicRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PublicRoute>
                <Products />
              </PublicRoute>
            }
          />
          <Route
            path="/products/:name"
            element={
              <PublicRoute>
                <Productdetail />
              </PublicRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <PublicRoute>
                <Collection />
              </PublicRoute>
            }
          />
          <Route
            path="/store"
            element={
              <PublicRoute>
                <Store />
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PublicRoute>
                <Aboutus />
              </PublicRoute>
            }
          />
          <Route
            path="/store-details"
            element={
              <PublicRoute>
                <StoreDetails />
              </PublicRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicRoute>
                <Contact />
              </PublicRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <PublicRoute>
                <Policy />
              </PublicRoute>
            }
          />

          {/* Dashboard Routes */}
          <Route path="/dashboard/*" element={<DashboardHome />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
