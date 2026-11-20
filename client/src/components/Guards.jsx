import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="center-load"><span className="spinner" /></div>;
  return user ? children : <Navigate to="/login" state={{ from: loc.pathname }} replace />;
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-load"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  return user.isAdmin ? children : <Navigate to="/" replace />;
}
