
import React, { useState } from 'react';
import SocialAuth from './SocialAuth';
import { useAuth } from '../../hooks/useAuth';
import {signupEmail} from '../../Firebase_Auth/authMethod'

const SignupForm = ({ onAuthSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    semester: '',
    university: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#10b981';
      case 4:
      case 5: return '#059669';
      default: return '#e5e7eb';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.semester) {
      newErrors.semester = 'Please select your semester';
    }

    if (!formData.university.trim()) {
      newErrors.university = 'University/College name is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        password: formData.password,
        semester: formData.semester,
        university: formData.university.trim()
      };

      const result = await signup(userData);
      if (result.success) {
        onAuthSuccess(result.user);
      } else {
        setErrors({ submit: result.error || 'Signup failed. Please try again.' });
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
      const result = await signup(userData, provider);
      if (result.success) {
        onAuthSuccess(result.user);
      } else {
        setErrors({ submit: `${provider} signup failed. Please try again.` });
      }
    } catch (error) {
      setErrors({ submit: `${provider} authentication error. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const semesters = [
    '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester',
    'Graduate', 'Post Graduate'
  ];

  return (
    <div className="auth-form">
      <div className="form-header">
        <h2>Create Account</h2>
        <p>Join thousands of students tracking their academic success</p>
      </div>

      <SocialAuth onSocialAuth={handleSocialAuth} isLoading={isLoading} />

      <div className="divider">
        <span>or create account with email</span>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        {errors.submit && (
          <div className="error-alert">
            <i className="fas fa-exclamation-triangle"></i>
            {errors.submit}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className={errors.firstName ? 'error' : ''}
                disabled={isLoading}
              />
            </div>
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className={errors.lastName ? 'error' : ''}
                disabled={isLoading}
              />
            </div>
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
        </div>

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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="semester">Current Semester</label>
            <div className="input-wrapper">
              <i className="fas fa-graduation-cap"></i>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={errors.semester ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Select semester</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
            {errors.semester && <span className="error-text">{errors.semester}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="university">University/College</label>
            <div className="input-wrapper">
              <i className="fas fa-university"></i>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Your institution"
                className={errors.university ? 'error' : ''}
                disabled={isLoading}
              />
            </div>
            {errors.university && <span className="error-text">{errors.university}</span>}
          </div>
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
              placeholder="Create password"
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
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{ 
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                ></div>
              </div>
              <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                {getPasswordStrengthText()}
              </span>
            </div>
          )}
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <i className="fas fa-lock"></i>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={errors.confirmPassword ? 'error' : ''}
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span className="checkmark"></span>
            I agree to the <a href="#terms" target="_blank">Terms of Service</a> and <a href="#privacy" target="_blank">Privacy Policy</a>
          </label>
          {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
        </div>

        <button
          type="submit"
          className="submit-btn signup-btn"
          disabled={isLoading || !formData.agreeToTerms}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Creating Account...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              Create Account
            </>
          )}
        </button>

        <div className="switch-auth">
          <p>Already have an account? <button type="button" onClick={onSwitchToLogin}>Sign In</button></p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
