import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

const WaitingVerification = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
      if (doc.exists() && doc.data().paymentVerified) {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  return (
    <div className="verification-waiting">
      <h2>Account Verification Pending</h2>
      <p>Your payment proof is under review. Please wait for admin verification.</p>
    </div>
  );
};

export default WaitingVerification;