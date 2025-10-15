import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from '../assets/Vivera Final Logo white.webp';
import "../styles/component/Header.css";

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const getTabWidth = (tabName) => {
    // Base width plus additional width based on text length
    return `${Math.max(57, tabName.length * 10)}px`;
  };

  return (
    <>
      <div className={`header ${isScrolled ? "scrolled" : ""}`}>
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className="logo">
          <NavLink to="/">
            <img src={logo} alt="logo" />
          </NavLink>
        </div>
        <div className={`menu${menuOpen ? " open" : ""}`}>
          <ul>
            <li>
              <NavLink
                to="/"
                className={() => {
                  return location.pathname === "/" ? "active" : "";
                }}
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
                className={() => {
                  return (location.pathname === "/products" || location.pathname.startsWith("/products/")) ? "active" : "";
                }}
                onClick={scrollToTop}
              >
                Products
              </NavLink>
              {(location.pathname === "/products" ||
                location.pathname.startsWith("/products/")) && (
                <div
                  className="nav-divider"
                  style={{ width: getTabWidth("Products") }}
                ></div>
              )}
            </li>
            <li>
              <NavLink
                to="/collection"
                className={() => {
                  // Only active if exactly on /collection route
                  return location.pathname === "/collection" ? "active" : "";
                }}
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
                className={() => {
                  return location.pathname === "/store" ? "active" : "";
                }}
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
                className={() => {
                  return location.pathname === "/about" ? "active" : "";
                }}
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
            <li className="mobile-contact-btn">
              <NavLink to="/contact" className="contact-btn-mobile">
                Contact Us
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="btn">
          <NavLink to="/contact" className="contact-btn">
            Contact Us
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Header;
