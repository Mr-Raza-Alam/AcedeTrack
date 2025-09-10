import React from 'react';

const CTA = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="cta-section" id="signup">
      <div className="container">
        <h2>Ready to Excel in Your Studies?</h2>
        <p>Join thousands of successful students who are already using AcadeTrack to achieve their academic goals</p>
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={() => scrollToSection('signup')}
          >
            <i className="fas fa-graduation-cap"></i> Start Your Journey
          </button>
          <button 
            className="btn-secondary"
            onClick={() => scrollToSection('demo')}
          >
            <i className="fas fa-question-circle"></i> Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;

