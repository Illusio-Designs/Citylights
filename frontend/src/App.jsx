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
import SplashScreen from "./component/SplashScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dashboard Pages
import DashboardHome from "./pages/dashboard/index";

const PublicRoute = ({ children, showSplash, splashCompleted }) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Don't show loader if splash screen is active
    if (showSplash) {
      setIsLoading(false);
      return;
    }

    // If splash just completed, don't show loader for first page load
    if (splashCompleted && !sessionStorage.getItem('page-loaded-after-splash')) {
      setIsLoading(false);
      sessionStorage.setItem('page-loaded-after-splash', 'true');
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname, showSplash, splashCompleted]);

  if (isLoading && !showSplash) {
    return <Loader />;
  }

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashCompleted, setSplashCompleted] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = sessionStorage.getItem('vivera-visited');
    
    // Check if current path is a dashboard route
    const isDashboardRoute = window.location.pathname.startsWith('/dashboard');
    
    if (!hasVisited && !isDashboardRoute) {
      setShowSplash(true);
      // Mark as visited for this session
      sessionStorage.setItem('vivera-visited', 'true');
    } else {
      // If already visited or on dashboard route, mark splash as completed
      setSplashCompleted(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashCompleted(true);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Home />
              </PublicRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Products />
              </PublicRoute>
            }
          />
          <Route
            path="/products/:name"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Productdetail />
              </PublicRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Collection />
              </PublicRoute>
            }
          />
          <Route
            path="/store"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Store />
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Aboutus />
              </PublicRoute>
            }
          />
          <Route
            path="/store-details/:name"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <StoreDetails />
              </PublicRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Contact />
              </PublicRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <PublicRoute showSplash={showSplash} splashCompleted={splashCompleted}>
                <Policy />
              </PublicRoute>
            }
          />

          {/* Dashboard Routes */}
          <Route path="/dashboard/*" element={<DashboardHome />} />
        </Routes>
      </Router>
      
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
