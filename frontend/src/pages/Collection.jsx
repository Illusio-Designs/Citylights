import React from "react";
import Header from "../component/Header";
import collection from "../assets/collection.png";
import "../styles/pages/Collection.css";


const Collection = () => {
    return (
      <>
      <Header />
        <div className="collection-container">
          
            <div className="collection-heading" >
            <img src={collection}
              alt="collection"
              className="collection-bg-img"
            />
            <span className="collection-title">Collection</span>
          </div>
        </div>
        </>
    )
}
export default Collection;  