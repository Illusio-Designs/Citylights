import Home from "./pages/Home";
import Products from "./pages/Products";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Collection from "./pages/Collection";
import Store from './pages/Store';
import Aboutus from './pages/Aboutus';
import StoreDetails from './pages/StoreDetails';
import Contact from './pages/Contact';
import Policy from './pages/Policy';

// Dashboard Pages
import DashboardHome from './pages/dashboard/index';
import UsersPage from './pages/dashboard/users';
import ProductsPage from './pages/dashboard/products';
import CollectionsPage from './pages/dashboard/collections';
import StoresPage from './pages/dashboard/stores';
import ReviewsPage from './pages/dashboard/reviews';
import OrdersPage from './pages/dashboard/orders';
import ReportsPage from './pages/dashboard/reports';
import SettingsPage from './pages/dashboard/settings';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/store" element={<Store />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/store-details" element={<StoreDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<Policy />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardHome />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
