import React from "react";
import Header from "../component/Header";
import collection from "../assets/collection.png";
import "../styles/pages/Collection.css";
import Footer from "../component/Footer";
import { publicCollectionService } from "../services/publicService";

const Collection = () => {
  const [collections, setCollections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    publicCollectionService.getCollections()
      .then((res) => {
        setCollections(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load collections");
        setLoading(false);
      });
  }, []);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const getCollectionImageUrl = (img) =>
    img && !img.startsWith('http')
      ? `${BASE_URL.replace('/api', '')}/uploads/collections/${img}`
      : (img || "/default-collection.png");

  return (
    <>
      <Header />
      <div className="collection-container">
        <div className="collection-heading">
          <img src={collection} alt="collection" className="collection-bg-img" />
          <span className="collection-title">Collection</span>
        </div>
        <div className="collection-cards">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div style={{ color: 'red' }}>{error}</div>
          ) : collections.length === 0 ? (
            <div>No collections found.</div>
          ) : (
            collections.map((col, idx) => (
              <div className="collection-card" key={col.id || idx}>
                <div className="card-image">
                  <img src={getCollectionImageUrl(col.image)} alt={col.name} />
                </div>
                <div className="card-title">{col.name}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Collection;