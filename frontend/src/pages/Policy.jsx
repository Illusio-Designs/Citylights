import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import policyBg from '../assets/policy.webp';
import '../styles/pages/Policy.css';

const sections = [
  'Data Access',
  'Contact Info',
  'Data Usage',
  'Cookies',
  'Rights',
];

const policyContent = {
  'Data Access':
    'Vivera Lighting collects personal information only when it is genuinely required to deliver our products and services efficiently. This information may include your name, contact number, email address, billing and shipping details, and order-related data. Access to this information is strictly limited to authorized employees, internal teams, and trusted service providers who need the data to perform essential business operations. We use secure servers, restricted access controls, and internal policies to prevent unauthorized access, misuse, or disclosure of personal information. While we take all reasonable measures to safeguard your data, users are advised that no digital transmission or storage method can be guaranteed to be completely secure.',

  'Contact Info':
    'If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, you may contact Vivera Lighting using the official contact details provided on our website. Our customer support and compliance teams are available to assist with privacy-related inquiries, data access requests, or clarification about our practices. We aim to respond to all legitimate requests within a reasonable timeframe and in accordance with applicable data protection laws. Maintaining transparency and trust with our customers is a core priority of our organization.',

  'Data Usage':
    'The personal information collected by Vivera Lighting is used strictly for lawful and business-related purposes. These purposes include processing and fulfilling customer orders, managing payments, coordinating deliveries, providing after-sales support, improving product quality, enhancing website functionality, and personalizing user experiences. We may also use your information to communicate service updates, respond to inquiries, send order-related notifications, and share promotional communications where permitted. Vivera Lighting does not sell, rent, or trade customer data to third parties for marketing or advertising purposes, and any data sharing is limited to trusted partners who comply with strict confidentiality obligations.',

  'Cookies':
    'Our website uses cookies and similar tracking technologies to improve performance, enhance user experience, and analyze visitor behavior. Cookies allow us to understand how users navigate our site, which pages are most frequently visited, and how our services can be improved. These technologies also help remember user preferences and provide a smoother browsing experience. Users may choose to accept or reject cookies through their browser settings at any time; however, disabling cookies may limit certain features or functionality of the website. By continuing to use our site, you consent to the use of cookies as outlined in this policy.',

  'Rights':
    'As a user of the Vivera Lighting website, you have certain rights regarding your personal information. These rights include the ability to request access to the data we hold about you, request corrections to inaccurate or outdated information, and request deletion of your personal data where legally permissible. You may also withdraw consent for marketing communications or opt out of promotional emails at any time. To exercise these rights, users may contact our support team using the contact information available on the website. We are committed to respecting user privacy and complying with applicable data protection regulations.',
};

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
                className={`policy-sidebar-item${
                  section === selectedSection ? ' active' : ''
                }`}
                onClick={() => setSelectedSection(section)}
              >
                {section}
              </div>
            ))}
          </div>
          <div className="policy-main-content">
            <h2>{selectedSection}</h2>
            <p>{policyContent[selectedSection]}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Policy;
