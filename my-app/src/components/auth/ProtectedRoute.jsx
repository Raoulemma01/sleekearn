import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="auth-loading">Loading...</div>;
  
  if (!currentUser) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;