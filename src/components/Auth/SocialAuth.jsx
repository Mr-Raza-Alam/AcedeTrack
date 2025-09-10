
import React from 'react';

const SocialAuth = ({ onSocialAuth, isLoading }) => {
  const handleGoogleAuth = async () => {
    try {
      // Google OAuth implementation
      const response = await new Promise((resolve) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: 'your-google-client-id'
          }).then(() => {
            const authInstance = window.gapi.auth2.getAuthInstance();
            authInstance.signIn().then(googleUser => {
              const profile = googleUser.getBasicProfile();
              resolve({
                email: profile.getEmail(),
                firstName: profile.getGivenName(),
                lastName: profile.getFamilyName(),
                avatar: profile.getImageUrl(),
                provider: 'google'
              });
            });
          });
        });
      });
      
      onSocialAuth('Google', response);
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  const handleGitHubAuth = async () => {
    try {
      // GitHub OAuth implementation
      const clientId = 'your-github-client-id';
      const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
      const scope = 'user:email';
      
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    } catch (error) {
      console.error('GitHub auth error:', error);
    }
  };

  const handleTwitterAuth = async () => {
    try {
      // Twitter OAuth implementation
      const response = await fetch('/api/auth/twitter/request-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { oauth_token } = await response.json();
      window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
    } catch (error) {
      console.error('Twitter auth error:', error);
    }
  };

  return (
    <div className="social-auth">
      <div className="social-buttons">
        <button
          type="button"
          className="social-btn google-btn"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <i className="fab fa-google"></i>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          className="social-btn github-btn"
          onClick={handleGitHubAuth}
          disabled={isLoading}
        >
          <i className="fab fa-github"></i>
          <span>Continue with GitHub</span>
        </button>

        <button
          type="button"
          className="social-btn twitter-btn"
          onClick={handleTwitterAuth}
          disabled={isLoading}
        >
          <i className="fab fa-twitter"></i>
          <span>Continue with Twitter</span>
        </button>
      </div>
    </div>
  );
};

export default SocialAuth;
