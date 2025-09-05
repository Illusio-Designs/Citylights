import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminAuthService } from "../../services/adminService";
import logo from "../../assets/Vivera Final Logo white.png";
import "../../styles/dashboard/AuthPage.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await adminAuthService.login({ email, password });
      localStorage.setItem("admin_token", res.data.token);
      
      // Check user type and redirect accordingly
      if (res.data.user.userType === "storeowner") {
        // Store store owner info in localStorage
        localStorage.setItem("store_owner_id", res.data.user.id);
        localStorage.setItem("store_owner_name", res.data.user.fullName);
        localStorage.setItem("store_owner_email", res.data.user.email);
        
        toast.success("Login successful! Welcome to your store dashboard.");
        navigate("/dashboard/store-owner", { replace: true });
      } else {
        // Admin user - redirect to admin dashboard
        toast.success("Login successful! Welcome to the admin dashboard.");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-container">
            <img src={logo} alt="Citylights Logo" className="auth-logo" />
          </div>
          <h1>Citylights Dashboard</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>© 2024 Citylights. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}