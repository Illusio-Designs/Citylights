import React from "react";
import logo from "../assets/Vivera Final Logo white.png";
import "../styles/Header.css";

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
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Products</a>
            </li>
            <li>
              <a href="#">Collection</a>
            </li>
            <li>
              <a href="#">Store Locator</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>
        <div className="btn">Login</div>
      </div>
    </>
  );
};

export default Header;
