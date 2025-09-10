
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPassword from './ForgotPassword';
import '../../styles/auth.css';

const AuthContainer = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="auth-content">
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-header">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <span>AcadeTrack</span>
          </div>
          <p className="tagline">Track your academic journey with intelligence</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button 
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-form-container">
          {activeTab === 'login' ? (
            <LoginForm 
              onAuthSuccess={onAuthSuccess}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          ) : (
            <SignupForm 
              onAuthSuccess={onAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>

        <div className="auth-footer">
          <p>&copy; 2025 AcadeTrack. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#help">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
