import React from 'react';
import './OurClients.css';

const OurClients = () => {
  // All 45 brand logos
  const allBrands = [
    { name: 'Airtel', logo: '/brands/Airtel.png' },
    { name: 'Ajanta Quartz', logo: '/brands/AjantaQuartz.png' },
    { name: 'American Chase', logo: '/brands/American Chase.png' },
    { name: 'Armanino', logo: '/brands/Armanino.png' },
    { name: 'Artha Bharat Group', logo: '/brands/Artha Bharat Group.png' },
    { name: 'Dilip Ladiani Associates', logo: '/brands/Dilip Ladiani Associates.png' },
    { name: 'Godrej', logo: '/brands/Godrej.png' },
    { name: 'Grant Thornton', logo: '/brands/Grant_Thornton_logo.png' },
    { name: 'Hotel Greenland', logo: '/brands/Hotel Greenland.png' },
    { name: 'Injala', logo: '/brands/Injala.png' },
    { name: 'Lemon Tree', logo: '/brands/lemon-tree.png' },
    { name: 'Lendingkart', logo: '/brands/lendingkaart.png' },
    { name: 'Magnit', logo: '/brands/Magnit.png' },
    { name: 'Markwell Global', logo: '/brands/Markwell Global.png' },
    { name: 'Maruti Suzuki', logo: '/brands/Maruti Suzuki.webp' },
    { name: 'MRI Software', logo: '/brands/MRI Software.png' },
    { name: 'NeoSOFT', logo: '/brands/NeoSOFT.png' },
    { name: 'Novo', logo: '/brands/Novo.png' },
    { name: 'OPPO', logo: '/brands/oppo.png' },
    { name: 'Plantix', logo: '/brands/Plantix_logo.png' },
    { name: 'Poojara', logo: '/brands/Poojara.png' },
    { name: 'Protiviti', logo: '/brands/Protiviti.png' },
    { name: 'Qatar Airways', logo: '/brands/Qatar Airways.png' },
    { name: 'Radisson Hotels', logo: '/brands/Radisson Hotels.png' },
    { name: 'Raivat Inn', logo: '/brands/Raivat Inn.png' },
    { name: 'Royal Retreat', logo: '/brands/Royal Retreat.png' },
    { name: 'Saath Samachar', logo: '/brands/sanjsamachar.png' },
    { name: 'Sarovar Hotels', logo: '/brands/SarovarHotels.png' },
    { name: 'Sayaji', logo: '/brands/Sayaji.png' },
    { name: 'SHILP Group', logo: '/brands/SHILP Group.png' },
    { name: 'SKSE Securities', logo: '/brands/SKSE Securities.png' },
    { name: 'Sonam', logo: '/brands/Sonam.png' },
    { name: 'TeamLease', logo: '/brands/TeamLease.png' },
    { name: 'TGT – The Grand Thakar', logo: '/brands/TGT – The Grand Thakar.png' },
    { name: 'The Fern Hotels & Resorts', logo: '/brands/The Fern Hotels & Resorts.png' },
    { name: 'The Orchid Hotels', logo: '/brands/The Orchid Hotels.png' },
    { name: 'Translate By Humans', logo: '/brands/Translate By Humans.png' },
    { name: 'Vadilal', logo: '/brands/Vadilal.png' },
    { name: 'Vena', logo: '/brands/Vena.png' },
    { name: 'VITS', logo: '/brands/vits.png' },
    { name: 'Vivo', logo: '/brands/Vivo.png' },
    { name: 'Waaree', logo: '/brands/Waaree.webp' },
    { name: 'WizeHive', logo: '/brands/WizeHive.jpg' },
    { name: 'Wockhardt Hospitals', logo: '/brands/Wockhardt Hospitals.png' },
    { name: 'Worley', logo: '/brands/Worley.png' }
  ];

  // Split brands into two rows: 22 in first row, 23 in second row
  const firstRowBrands = allBrands.slice(0, 22);
  const secondRowBrands = allBrands.slice(22, 45);

  const renderBrandRow = (brands, direction, rowClass) => (
    <div className={`brand-row ${rowClass}`}>
      <div className={`brand-track ${direction}`}>
        {/* Triple the brands for seamless infinite scroll */}
        {[...brands, ...brands, ...brands].map((brand, index) => (
          <div key={`${brand.name}-${index}`} className="brand-item">
            <img
              src={brand.logo}
              alt={brand.name}
              className="brand-logo"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="our-clients-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Clients</h2>
          <p className="section-subtitle">
            Trusted by leading brands across industries
          </p>
        </div>
        
        <div className="brands-container">
          {/* First row - sliding left to right */}
          {renderBrandRow(firstRowBrands, 'slide-left-to-right', 'first-row')}
          
          {/* Second row - sliding right to left */}
          {renderBrandRow(secondRowBrands, 'slide-right-to-left', 'second-row')}
        </div>
      </div>
    </section>
  );
};

export default OurClients;