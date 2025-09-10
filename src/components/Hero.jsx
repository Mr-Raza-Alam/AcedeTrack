import React, { useEffect, useState } from 'react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="floating-elements"></div>
      <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
        <h1>Master Your Academic Journey</h1>
        <p>
          Transform your study habits with intelligent progress tracking, 
          personalized insights, and detailed performance analytics that help 
          you achieve academic excellence.
        </p>
        
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={() => scrollToSection('signup')}
          >
            <i className="fas fa-rocket"></i> Start Tracking Now
          </button>
          <button 
            className="btn-secondary"
            onClick={() => scrollToSection('demo')}
          >
            <i className="fas fa-play"></i> Watch Demo
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Active Students</span>
          </div>
          <div className="stat">
            <span className="stat-number">95%</span>
            <span className="stat-label">Grade Improvement</span>
          </div>
          <div className="stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Progress Tracking</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

