import { useState } from "react";
import "../styles/component/FAQ.css";

const FAQ = ({ faqs = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Default FAQs if none provided
  const defaultFAQs = [
    {
      question: "What makes Vivera Lightings different from other lighting companies?",
      answer: "At Vivera Lightings, we are not a retail brand. We are a project-driven, customization-led lighting partner. Every lighting solution is designed, refined, and perfected specifically for your space, ensuring that light adapts to your environment rather than the other way around."
    },
    {
      question: "Do you provide custom lighting solutions for commercial projects?",
      answer: "Absolutely! We specialize in custom lighting solutions for commercial spaces including offices, restaurants, industrial facilities, and retail environments. Our design team works closely with architects and interior designers to create unique lighting installations that enhance your space's functionality and aesthetic appeal."
    },
    {
      question: "What types of spaces do you design lighting for?",
      answer: "We design lighting for a wide range of applications including residential rooms, office spaces, industrial facilities, restaurants, retail stores, and hospitality venues. Each project is approached with a deep understanding of the space's specific requirements and intended atmosphere."
    },
    {
      question: "How does your design process work?",
      answer: "Our design process begins with understanding your space, its purpose, and your vision. We then create customized lighting solutions that consider factors like natural light, architectural elements, functionality requirements, and desired ambiance. Every design is refined through collaboration until it perfectly matches your needs."
    },
    {
      question: "Do you offer energy-efficient lighting solutions?",
      answer: "Yes, we prioritize energy efficiency in all our designs. We use the latest LED technology and smart lighting systems that not only reduce energy consumption but also provide superior light quality and longevity. Our solutions help you achieve both environmental and cost benefits."
    },
    {
      question: "Can you work with existing architectural plans?",
      answer: "Certainly! We collaborate with architects, interior designers, and contractors throughout the design and construction process. We can integrate our lighting solutions seamlessly with existing architectural plans or provide input during the planning phase for optimal results."
    }
  ];

  const faqData = faqs.length > 0 ? faqs : defaultFAQs;

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">Find answers to common questions about our lighting products and services</p>
      </div>
      
      <div className="faq-list">
        {faqData.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              aria-expanded={activeIndex === index}
            >
              <span className="faq-question-text">{faq.question}</span>
              <span className="faq-icon">
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>
            
            <div className={`faq-answer ${activeIndex === index ? 'expanded' : ''}`}>
              <div className="faq-answer-content">
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;