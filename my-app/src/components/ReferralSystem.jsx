import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ReferralSystem.css';

export default function ReferralSystem() {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const referralLink = currentUser 
    ? `${window.location.origin}/ref/${currentUser.uid}`
    : '';

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!currentUser?.uid) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setReferrals(userData.referrals || []);
        }
      } catch (error) {
        console.error("Error fetching referrals:", error);
        setError('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [currentUser]);

  if (!currentUser) {
    return <div className="auth-warning">Please sign in to view referrals</div>;
  }

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="referral-system">
      <h2>Your Referral Network</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="referral-card">
        <h3>Your Unique Referral Link</h3>
        <div className="link-container">
          <input 
            type="text" 
            value={referralLink} 
            readOnly 
            aria-label="Referral link"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(referralLink)}
            aria-label="Copy referral link"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="referral-list">
        <h3>Your Referrals ({referrals.length})</h3>
        {referrals.length > 0 ? (
          <ul>
            {referrals.map((ref, index) => (
              <li key={index}>
                {ref.email} - {new Date(ref.timestamp?.toDate()).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No referrals yet</p>
        )}
      </div>
    </div>
  );
}