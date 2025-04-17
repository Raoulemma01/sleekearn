import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const VerifiedRoute = ({ children }) => {
  const { userData, loading } = useAuth();
  
  if (loading) return <div>Verifying...</div>;
  return userData?.paymentVerified ? children : <Navigate to="/waiting-verification" replace />;
};

export default VerifiedRoute;