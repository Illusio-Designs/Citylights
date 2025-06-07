import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import policyBg from '../assets/policy.png';
import '../styles/pages/Policy.css';

const sections = [
  'Data Access',
  'Contact Info',
  'Data Usage',
  'Cookies',
  'Rights',
];

const Policy = () => {
  const [selectedSection, setSelectedSection] = useState('Data Usage');

  return (
    <>
      <Header />
      <div className="policy">
        <div className="policy-heading-section">
          <img src={policyBg} alt="policy bg" className="policy-bg-img" />
          <span className="policy-title">Privacy Policy</span>
        </div>
        <div className="policy-content-row">
          <div className="policy-sidebar">
            {sections.map((section) => (
              <div
                key={section}
                className={`policy-sidebar-item${section === selectedSection ? ' active' : ''}`}
                onClick={() => setSelectedSection(section)}
              >
                {section}
              </div>
            ))}
          </div>
          <div className="policy-main-content">
            <h2>{selectedSection}</h2>
            <p>
              It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Policy; 