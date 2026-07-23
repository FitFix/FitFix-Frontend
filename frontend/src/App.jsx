import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { ThemeProvider } from './context/ThemeContext';

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/plan" element={<MyPlan />} />
              <Route path="/exercises" element={<ExerciseSelector />} />
              <Route path="/workout/:exerciseId" element={<AIVisionContainer />} />
              <Route path="/admin" element={<AdminGymPanel />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
