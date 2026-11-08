import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExerciseSelector = lazy(() => import('./pages/ExerciseSelector'));
const AIVisionContainer = lazy(() => import('./pages/AIVisionContainer'));
const AdminGymPanel = lazy(() => import('./pages/AdminGymPanel'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const MyPlan = lazy(() => import('./pages/MyPlan'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="text-accent text-lg font-bold animate-pulse">FitFix</span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-text font-sans transition-colors duration-300">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              {/* Old links to the separate manager login go to the shared login */}
              <Route path="/manager-login" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/plan" element={<ProtectedRoute><MyPlan /></ProtectedRoute>} />
              <Route path="/exercises" element={<ProtectedRoute><ExerciseSelector /></ProtectedRoute>} />
              <Route path="/workout/:exerciseId" element={<ProtectedRoute><AIVisionContainer /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminGymPanel /></ProtectedRoute>} />
              <Route path="/pricing" element={<Pricing />} />
              {/* Unknown URLs go home instead of rendering a blank page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
