
import React, { useState } from 'react';
import SocialAuth from './SocialAuth';
import { useAuth } from '../../hooks/useAuth';
import {loginEmail} from "../../Firebase_Auth/authMethod";

const LoginForm = ({ onAuthSuccess, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      if (result.success) {
        onAuthSuccess(result.user);
      } else {
        setErrors({ submit: result.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider, userData) => {
    setIsLoading(true);
    try {
      const result = await login(null, null, false, provider, userData);
      if (result.success) {
        onAuthSuccess(result.user);
      } else {
        setErrors({ submit: `${provider} login failed. Please try again.` });
      }
    } catch (error) {
      setErrors({ submit: `${provider} authentication error. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="form-header">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue your academic journey</p>
      </div>

      <SocialAuth onSocialAuth={handleSocialAuth} isLoading={isLoading} />

      <div className="divider">
        <span>or continue with email</span>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {errors.submit && (
          <div className="error-alert">
            <i className="fas fa-exclamation-triangle"></i>
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <i className="fas fa-lock"></i>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-options">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span className="checkmark"></span>
            Remember me
          </label>
          <button
            type="button"
            className="forgot-password-link"
            onClick={onForgotPassword}
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="submit-btn login-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Signing In...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
