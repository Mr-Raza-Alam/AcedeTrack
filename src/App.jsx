
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./landingPage";
import Dashboard from "./dashboardPage";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import SocialAuth from "./components/Auth/SocialAuth";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/social" element={<SocialAuth />} />

        {/* Example protected page */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <h1>Welcome to Dashboard!</h1>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

    // <Router>
    //   <Routes>
    //     <Route path="/" element={<LandingPage />} />
    //     <Route path="/auth" element={<AuthPage />} />
    //     <Route path="/dashboard" element={<Dashboard />} />
    //   </Routes>
    // </Router>