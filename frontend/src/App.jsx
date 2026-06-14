import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExerciseSelector from './pages/ExerciseSelector';
import AIVisionContainer from './pages/AIVisionContainer';
import AdminGymPanel from './pages/AdminGymPanel';
import Pricing from './pages/Pricing';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseSelector />} />
          <Route path="/workout/:exerciseId" element={<AIVisionContainer />} />
          <Route path="/admin" element={<AdminGymPanel />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
