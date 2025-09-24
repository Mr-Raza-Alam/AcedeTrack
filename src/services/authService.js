
// Mock API endpoints - replace with your actual backend URLs
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Set authorization headers for API calls
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Handle API responses and errors
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Regular email/password login
  async login(email, password, rememberMe = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          rememberMe
        })
      });

      const data = await this.handleResponse(response);
      
      // Store tokens and user data
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Set token expiration handling
      this.scheduleTokenRefresh(data.expiresIn);

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Regular email/password signup
  async signup(userData) {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'semester', 'university'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate email format
      if (!this.isValidEmail(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...userData,
          email: userData.email.toLowerCase().trim(),
          firstName: userData.firstName.trim(),
          lastName: userData.lastName.trim(),
          university: userData.university.trim()
        })
      });

      const data = await this.handleResponse(response);
      
      // Store tokens and user data
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set token expiration handling
      this.scheduleTokenRefresh(data.expiresIn);

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Social authentication (Google, GitHub, Twitter)
  async socialAuth(provider, socialData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/social`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          provider,
          ...socialData
        })
      });

      const data = await this.handleResponse(response);
      
      // Store tokens and user data
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set token expiration handling
      this.scheduleTokenRefresh(data.expiresIn);

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Social auth error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Google OAuth specific implementation
  async googleAuth() {
    return new Promise((resolve, reject) => {
      // Load Google API
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => this.initializeGoogleAuth(resolve, reject);
        document.head.appendChild(script);
      } else {
        this.initializeGoogleAuth(resolve, reject);
      }
    });
  }

  initializeGoogleAuth(resolve, reject) {
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance();
        authInstance.signIn().then(googleUser => {
          const profile = googleUser.getBasicProfile();
          const authResponse = googleUser.getAuthResponse();
          
          resolve({
            email: profile.getEmail(),
            firstName: profile.getGivenName(),
            lastName: profile.getFamilyName(),
            avatar: profile.getImageUrl(),
            googleId: profile.getId(),
            accessToken: authResponse.access_token
          });
        }).catch(reject);
      }).catch(reject);
    });
  }

  // GitHub OAuth implementation
  async githubAuth() {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/github`;
    const scope = 'user:email';
    const state = this.generateRandomState();
    
    // Store state for validation
    sessionStorage.setItem('github_oauth_state', state);
    
    // Redirect to GitHub OAuth
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  // Handle GitHub OAuth callback
  async handleGitHubCallback(code, state) {
    try {
      // Validate state
      const storedState = sessionStorage.getItem('github_oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid OAuth state');
      }
      
      sessionStorage.removeItem('github_oauth_state');

      const response = await fetch(`${API_BASE_URL}/auth/github/callback`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ code, state })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('GitHub callback error:', error);
      throw error;
    }
  }

  // Twitter OAuth implementation
  async twitterAuth() {
    try {
      // Step 1: Get request token
      const response = await fetch(`${API_BASE_URL}/auth/twitter/request-token`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const { oauth_token, oauth_token_secret } = await this.handleResponse(response);
      
      // Store token secret for callback
      sessionStorage.setItem('twitter_oauth_token_secret', oauth_token_secret);
      
      // Redirect to Twitter OAuth
      window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
    } catch (error) {
      console.error('Twitter auth error:', error);
      throw error;
    }
  }

  // Handle Twitter OAuth callback
  async handleTwitterCallback(oauth_token, oauth_verifier) {
    try {
      const oauth_token_secret = sessionStorage.getItem('twitter_oauth_token_secret');
      if (!oauth_token_secret) {
        throw new Error('Missing OAuth token secret');
      }
      
      sessionStorage.removeItem('twitter_oauth_token_secret');

      const response = await fetch(`${API_BASE_URL}/auth/twitter/callback`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          oauth_token,
          oauth_token_secret,
          oauth_verifier
        })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Twitter callback error:', error);
      throw error;
    }
  }

  // Password reset request
  async requestPasswordReset(email) {
    try {
      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email: email.toLowerCase().trim()
        })
      });

      await this.handleResponse(response);
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          token,
          password: newPassword
        })
      });

      await this.handleResponse(response);
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Change password for authenticated users
  async changePassword(currentPassword, newPassword) {
    try {
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      await this.handleResponse(response);
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Refresh authentication token
  async refreshAuthToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });

      const data = await this.handleResponse(response);
      
      // Update tokens
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Schedule next refresh
      this.scheduleTokenRefresh(data.expiresIn);

      return {
        success: true,
        token: data.token
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Schedule automatic token refresh
  scheduleTokenRefresh(expiresIn) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAuthToken();
      }, refreshTime);
    }
  }

  // Logout user and clear all stored data
  logout() {
    this.token = null;
    this.refreshToken = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Clear all stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('studentData');
    sessionStorage.clear();

    // Clear any social auth sessions
    this.clearSocialAuthSessions();

    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Clear social authentication sessions
  clearSocialAuthSessions() {
    // Google sign out
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut();
      }
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.getCurrentUser());
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await this.handleResponse(response);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Verify email address
  async verifyEmail(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ token })
      });

      await this.handleResponse(response);
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Resend email verification
  async resendEmailVerification() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      await this.handleResponse(response);
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Utility Functions

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        isValid: false,
        message: 'Password must contain uppercase, lowercase, and numbers'
      };
    }

    return { isValid: true, message: 'Password is strong' };
  }

  // Generate random state for OAuth
  generateRandomState() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  // Get user-friendly error messages
  getErrorMessage(error) {
    const errorMessages = {
      'Invalid credentials': 'The email or password you entered is incorrect.',
      'User already exists': 'An account with this email already exists.',
      'User not found': 'No account found with this email address.',
      'Invalid token': 'The verification link is invalid or has expired.',
      'Token expired': 'Your session has expired. Please log in again.',
      'Network error': 'Unable to connect to the server. Please check your internet connection.',
      'Validation error': 'Please check your input and try again.',
      'Server error': 'An internal server error occurred. Please try again later.'
    };

    return errorMessages[error.message] || error.message || 'An unexpected error occurred.';
  }

  // Mock data for development (remove in production)
  generateMockUserData(email, firstName, lastName) {
    return {
      id: Date.now(),
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=667eea&color=fff`,
      semester: '3rd Semester',
      university: 'Sample University',
      joinedAt: new Date().toISOString(),
      emailVerified: true,
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en'
      }
    };
  }

  // Mock authentication for development
  async mockAuth(email, password, userData = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple mock validation
    if (!userData && (!email || !password)) {
      throw new Error('Invalid credentials');
    }

    const mockUser = userData || this.generateMockUserData(
      email,
      'John',
      'Doe'
    );

    const mockToken = btoa(JSON.stringify({
      userId: mockUser.id,
      email: mockUser.email,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));

    return {
      user: mockUser,
      token: mockToken,
      refreshToken: mockToken + '_refresh',
      expiresIn: 86400 // 24 hours in seconds
    };
  }
}

// Create and export a singleton instance
const authService = new AuthService();

export default authService;

// Export specific methods for easier importing
export const {
  login,
  signup,
  socialAuth,
  googleAuth,
  githubAuth,
  twitterAuth,
  requestPasswordReset,
  resetPassword,
  changePassword,
  refreshAuthToken,
  logout,
  getCurrentUser,
  isAuthenticated,
  updateProfile,
  verifyEmail,
  resendEmailVerification
} = authService;
