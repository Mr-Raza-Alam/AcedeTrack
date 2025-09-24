// src/components/Authy.jsx (or src/pages/Authy.jsx)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  signupEmail, 
  loginEmail, 
  loginGoogle, 
  loginGithub, 
  loginTwitter 
} from '../Firebase_Auth/authMethods';

import '../styles/Authy.css'
const Authy = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await loginEmail(email, password);
        console.log('Login successful');
      } else {
        await signupEmail(email, password);
        console.log('Signup successful');
      }
      // Navigation will be handled automatically by useEffect above
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    if (loading) return;
    
    setLoading(true);
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await loginGoogle();
          break;
        case 'github':
          result = await loginGithub();
          break;
        case 'twitter':
          result = await loginTwitter();
          break;
        default:
          setLoading(false);
          return;
      }
      
      console.log(`${provider} authentication successful:`, result.user);
      // Navigation will be handled automatically by useEffect above
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return <div>Redirecting...</div>; // Show loading while redirecting
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Sign In to AcadeTrack' : 'Create Your Account'}</h2>
        
        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Social Authentication */}
        <div className="social-auth">
          <button 
            onClick={() => handleSocialAuth('google')}
            className="social-button google"
            disabled={loading}
          >
            <span>Google</span>
          </button>
          
          <button 
            onClick={() => handleSocialAuth('github')}
            className="social-button github"
            disabled={loading}
          >
            <span>GitHub</span>
          </button>
          
          <button 
            onClick={() => handleSocialAuth('twitter')}
            className="social-button twitter"
            disabled={loading}
          >
            <span>Twitter</span>
          </button>
        </div>

        {/* Toggle between Login/Signup */}
        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-button"
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Authy;

