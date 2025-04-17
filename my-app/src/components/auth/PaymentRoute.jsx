import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PaymentRoute = () => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="auth-loading">Loading...</div>;
  
  if (!currentUser) return <Navigate to="/login" replace />;

  if (userData?.paymentVerified) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default PaymentRoute; // Changed to default export