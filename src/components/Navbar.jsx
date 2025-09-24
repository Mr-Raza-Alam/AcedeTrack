// src/components/Navbar.jsx (add these imports and update the Get Started button)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useAuth } from '../hooks/useAuth'; // Add this import
import AcadyT from '../assets/AcadyT.png'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Add these hooks
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Update this function
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard'); // Go to dashboard if logged in
    } else {
      navigate('/auth'); // Go to auth page if not logged in
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo">
          <img src={AcadyT} alt="AcadeTrack" height='100rem' width='120rem'/>
          <span>AcadeTrack</span>
        </div>
        
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><button onClick={() => scrollToSection('features')}>Features</button></li>
          <li><button onClick={() => scrollToSection('how-it-works')}>How It Works</button></li>
          <li><button onClick={() => scrollToSection('about')}>About</button></li>
          <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
        </ul>

        <button 
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Update the button text based on auth status */}
        <button 
          className="cta-nav"
          onClick={handleGetStarted}
        >
          {user ? 'Go to Dashboard' : 'Get Started'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;



