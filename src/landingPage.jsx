// Landing page
// src/landingPage.jsx
import React from 'react';
import { useAuth } from './hooks/useAuth'; // Import your existing auth hook
import { useNavigate } from 'react-router-dom'; // Add navigation
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import CTA from './components/CTA';
import './styles/globals.css';

function LandingPage() { // Fixed function name (was "App")
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
}

export default LandingPage; // Fixed export name

