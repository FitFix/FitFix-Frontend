import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExerciseSelector from './pages/ExerciseSelector';
import AIVisionContainer from './pages/AIVisionContainer';
import AdminGymPanel from './pages/AdminGymPanel';
import PricingPage from './pages/PricingPage';
import BlogsPage from './pages/BlogsPage';
import SupportPage from './pages/SupportPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

const AppContent = () => {
  const location = useLocation();
  const isWorkoutPage = location.pathname.startsWith('/workout');
  const isLoginPage = location.pathname === '/login';
  const showHeader = !isWorkoutPage && !isLoginPage;

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col items-center">
      {showHeader && <Navbar />}
      <div className={isWorkoutPage ? "w-screen h-screen p-0 m-0 overflow-hidden" : "max-w-7xl mx-auto px-8 w-full flex-1 pt-4"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><ExerciseSelector /></ProtectedRoute>} />
          <Route path="/workout/:exerciseId" element={<ProtectedRoute><AIVisionContainer /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminGymPanel /></ProtectedRoute>} />
        </Routes>
      </div>
      {showHeader && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
