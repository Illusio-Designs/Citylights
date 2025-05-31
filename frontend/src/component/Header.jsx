import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/Vivera Final Logo white.png";
import "../styles/component/Header.css";

const Header = () => {
  return (
    <>
      <div className="header">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="menu">
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>
              <div className="nav-divider"></div>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Products
              </NavLink>
              <div className="nav-divider"></div>
            </li>
            <li>
              <NavLink
                to="/collection"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Collection
              </NavLink>
              <div className="nav-divider"></div>
            </li>
            <li>
              <NavLink
                to="/store-locator"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Store Locator
              </NavLink>
              <div className="nav-divider"></div>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About
              </NavLink>
              <div className="nav-divider"></div>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Contact Us
              </NavLink>
              <div className="nav-divider"></div>
            </li>
          </ul>
        </div>
        <div className="btn">Login</div>
      </div>
    </>
  );
};

export default Header;
