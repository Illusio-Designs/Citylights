import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import collection from '../assets/collection.webp';
import "../styles/pages/Collection.css";
import Footer from "../component/Footer";
import { publicCollectionService } from "../services/publicService";
import { getCollectionImageUrl } from "../utils/imageUtils";

const Collection = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    publicCollectionService.getCollections()
      .then((res) => {
        setCollections(res.data);
        setLoading(false);
      })
      .catch((error) => {
        const errorMessage = "Failed to load collections";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      });
  }, []);

  const handleCollectionClick = (collection) => {
    // Navigate to products page with collection filter
    navigate(`/products?collection=${encodeURIComponent(collection.name)}`);
  };

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
              <div 
                className="collection-card" 
                key={col.id || idx}
                onClick={() => handleCollectionClick(col)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-image shimmer">
                  <img
                    src={getCollectionImageUrl(col.image)}
                    alt={col.name}
                    style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                    onLoad={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                    onError={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                  />
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