import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Store.css";
import storebg from "../assets/store locator.png";
import locationIcon from "../assets/locationicon.png";
import whatsappIcon from "../assets/whatsappicon.png";
import searchIcon from "../assets/searchicon.png";
const Store = () =>{
    return(
       <>
       <Header/>
       <div className="store-container">
        <div className="store-heading"> 
           <img src={storebg} alt="store locator"  className="store-image-bg"/>
           <h1 className="store-heading-text">Store Locator</h1>
        </div>
        <div className="store-actions-row">
          <div className="store-action search">
            <span className="icon-search">
              <img src={searchIcon} alt="Search" className="icon-img" />
            </span>
            <input type="text" placeholder="Search" className="store-input" />
          </div>
          <div className="store-action location">
            <span className="icon-location">
              <img src={locationIcon} alt="Location" className="icon-img" />
            </span>
            <span>Use My Current Location</span>
          </div>
          <a className="store-action help" href="#">
            <span className="icon-help">
              <img src={whatsappIcon} alt="WhatsApp" className="icon-img" />
            </span>
            <span>Need Help?</span>
          </a>
        </div>
       </div>
       </> 
    )
}
export default Store;
