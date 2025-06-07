import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/Vivera Final Logo white.png";
import "../styles/component/Header.css";

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const getTabWidth = (tabName) => {
    // Base width plus additional width based on text length
    return `${Math.max(57, tabName.length * 10)}px`;
  };

  return (
    <>
      <div className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="menu">
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollToTop}
              >
                Home
              </NavLink>
              {location.pathname === "/" && (
                <div 
                  className="nav-divider" 
                  style={{ width: getTabWidth("Home") }}
                ></div>
              )}
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollToTop}
              >
                Products
              </NavLink>
              {location.pathname === "/products" && (
                <div 
                  className="nav-divider" 
                  style={{ width: getTabWidth("Products") }}
                ></div>
              )}
            </li>
            <li>
              <NavLink
                to="/collection"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollToTop}
              >
                Collection
              </NavLink>
              {location.pathname === "/collection" && (
                <div 
                  className="nav-divider" 
                  style={{ width: getTabWidth("Collection") }}
                ></div>
              )}
            </li>
            <li>
              <NavLink
                to="/store"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollToTop}
              >
                Store Locator
              </NavLink>
              {location.pathname === "/store" && (
                <div 
                  className="nav-divider" 
                  style={{ width: getTabWidth("Store Locator") }}
                ></div>
              )}
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollToTop}
              >
                About
              </NavLink>
              {location.pathname === "/about" && (
                <div 
                  className="nav-divider" 
                  style={{ width: getTabWidth("About") }}
                ></div>
              )}
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollToTop}
              >
                Contact Us
              </NavLink>
              {location.pathname === "/contact" && (
                <div 
                  className="nav-divider" 
                  style={{ width: getTabWidth("Contact Us") }}
                ></div>
              )}
            </li>
          </ul>
        </div>
        <div className="btn">Login</div>
      </div>
    </>
  );
};

export default Header;
