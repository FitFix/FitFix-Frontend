import { Navigate, useLocation } from 'react-router-dom';

// Client-side gate for logged-in pages. This is UX only — the API enforces
// access. `role` (optional) restricts the page to that user role.
const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    let user;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
    if (!user || user.role !== role) {
      return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
