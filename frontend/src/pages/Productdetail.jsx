import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import details from "../assets/details.png";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Productdetail.css";
import { publicProductService } from "../services/publicService";
import { publicCollectionService } from "../services/publicService";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const getProductImageUrl = (img) =>
  img && !img.startsWith('http')
    ? `${BASE_URL.replace('/api', '')}/uploads/products/${img}`
    : (img || "/default-product.png");

const Productdetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [collections, setCollections] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    publicProductService.getProducts()
      .then((res) => {
        const products = res.data.data || res.data || [];
        // Try to find by slug or by title
        const found = products.find(
          (p) =>
            (p.slug && p.slug === name) ||
            (p.title && p.title.toLowerCase().replace(/\s+/g, "-") === name)
        );
        if (found) {
          setProduct(found);
        } else {
          setError("Product Not Found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
    // Fetch collections
    publicCollectionService.getCollections().then((res) => {
      setCollections(res.data);
    });
  }, [name]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return (
      <div className="productdetail-notfound">
        <h2>{error}</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const variation = product.ProductVariations && product.ProductVariations[0];
  const images = variation && variation.ProductImages ? variation.ProductImages : [];
  const collection = collections.find((c) => c.id === product.collection_id);
  let pdfUrl = null;
  if (product.pdf) pdfUrl = product.pdf;
  else if (variation && variation.pdf) pdfUrl = variation.pdf;
  else if (variation && variation.ProductDocuments && variation.ProductDocuments[0] && variation.ProductDocuments[0].url) pdfUrl = variation.ProductDocuments[0].url;
else if (variation && variation.documents && variation.documents[0] && variation.documents[0].url) pdfUrl = variation.documents[0].url;

  return (
    <>
      <Header />
      <div className="productdetail-container">
        <div className="productdetail-heading-section">
          <img src={details} alt="details" className="details-img" />
          <span className="productdetail-title">Product Details</span>
        </div>
        <div className="productdetail-flex">
          {/* Main Image and Thumbnails */}
          <div className="productdetail-mainimg-section">
            <div className="productdetail-mainimg">
              <img src={getProductImageUrl(images[0]?.url)} alt={product.name} />
            </div>
            <div className="productdetail-thumbnails">
              {images.map((img, i) => (
                <img key={i} src={getProductImageUrl(img.url)} alt={`thumb-${i}`} />
              ))}
            </div>
          </div>
          {/* Details */}
          <div className="productdetail-info">
            <h2>{product.name}</h2>
            <div className="productdetail-subtitle">{product.slug}</div>
            <div className="productdetail-category">
              <span>Category :</span> <b>{collection ? collection.name : '-'}</b>
            </div>
            <div className="productdetail-specs">
              <div className="productdetail-specbox">Price<br /><b>{variation?.price ? `₹${parseFloat(variation.price).toLocaleString('en-IN')}` : '-'}</b></div>
              <div className="productdetail-specbox">Usecase<br /><b>{variation?.usecase || '-'}</b></div>
              <div className="productdetail-specbox">SKU<br /><b>{variation?.sku || '-'}</b></div>
            </div>
            <div className="productdetail-applications">
              <span>Description :</span> <span className="productdetail-appicon">{product.description}</span>
            </div>
            <div className="productdetail-actions">
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="productdetail-pdfbtn">
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 4}}>
                      <path d="M10 3V13M10 13L6 9M10 13L14 9" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="4" y="15" width="12" height="2" rx="1" fill="#222"/>
                    </svg>
                    PDF
                  </span>
                </a>
              )}
              <button className="productdetail-contactbtn">Contact for Purchase</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Productdetail;
