// src/App.jsx - Simplified version
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from "./landingPage";
import Dashboard from "./dashboardPage";
import { AuthContainer } from './components/Auth/AuthContainer';
import './styles/auth.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthContainer onAuthSuccess={() => {}} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;





// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LandingPage from "./landingPage";
// import Dashboard from "./dashboardPage";
// import Authy from './appAuth'

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/auth" element={<Authy />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

