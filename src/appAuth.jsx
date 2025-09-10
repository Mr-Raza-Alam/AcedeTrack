
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthContainer from './components/Auth/AuthContainer';
import Dashboard from './components/Dashboard';
import './styles/auth.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading AcadeTrack...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthContainer onAuthSuccess={() => {}} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
