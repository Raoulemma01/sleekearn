import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatXAF } from '../../utils/currency';

const WithdrawalPage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mtnNumber, setMTNNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data();
      setUserData(data);
      setMTNNumber(data.mtnNumber || '');
      setLoading(false);
    };
    
    fetchData();
  }, [currentUser]);

  const isWithdrawalDay = (type) => {
    const today = new Date();
    
    if (type === 'referral') {
      return today.getDay() === 3; // Wednesday
    }
    
    if (type === 'task') {
      return today.getDate() === 6; // 6th of month
    }
    
    return false;
  };

  const validateMTNNumber = (number) => {
    return /^\+2376\d{8}$/.test(number);
  };

  const handleWithdrawal = async (type) => {
    setError('');
    
    if (!validateMTNNumber(mtnNumber)) {
      setError('Invalid MTN number format. Use +2376XXXXXXXX');
      return;
    }

    if (!isWithdrawalDay(type)) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const amount = userData.balances[type];

      if (amount <= 0) {
        setError('No balance available for withdrawal');
        return;
      }

      await updateDoc(userRef, {
        [`balances.${type}`]: 0,
        mtnNumber: mtnNumber,
        [`lastWithdrawalDates.${type}`]: serverTimestamp(),
        withdrawalHistory: arrayUnion({
          type,
          amount,
          status: 'pending',
          dateRequested: serverTimestamp(),
          paymentMethod: 'mtn_mobile_money',
          phoneNumber: mtnNumber
        })
      });

      const updatedDoc = await getDoc(userRef);
      setUserData(updatedDoc.data());
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setError('Withdrawal failed. Please try again.');
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="withdrawal-page">
      <h2>Withdraw Earnings via MTN Mobile Money</h2>
      
      <div className="mtn-input-section">
        <label htmlFor="mtnNumber">MTN Mobile Money Number</label>
        <input
          id="mtnNumber"
          type="tel"
          placeholder="+2376XXXXXXXX"
          value={mtnNumber}
          onChange={(e) => setMTNNumber(e.target.value)}
          pattern="^\+2376\d{8}$"
          required
        />
        <small>Format: +2376XXXXXXXX</small>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="balance-cards">
        {/* Task Balance Card */}
        <div className={`balance-card ${isWithdrawalDay('task') ? 'active' : 'inactive'}`}>
          <h3>Task Balance</h3>
          <p className="amount">{formatXAF(userData.balances.task)}</p>
          <p className="info">
            {isWithdrawalDay('task') 
              ? "Available for withdrawal today!" 
              : "Available on the 6th of each month"}
          </p>
          <button
            onClick={() => handleWithdrawal('task')}
            disabled={!isWithdrawalDay('task') || userData.balances.task <= 0 || !mtnNumber}
          >
            {userData.lastWithdrawalDates?.task ? "Paid" : "Withdraw via MTN"}
          </button>
        </div>

        {/* Referral Balance Card */}
        <div className={`balance-card ${isWithdrawalDay('referral') ? 'active' : 'inactive'}`}>
          <h3>Referral Balance</h3>
          <p className="amount">{formatXAF(userData.balances.referral)}</p>
          <p className="info">
            {isWithdrawalDay('referral') 
              ? "Available for withdrawal today!" 
              : "Available every Wednesday"}
          </p>
          <button
            onClick={() => handleWithdrawal('referral')}
            disabled={!isWithdrawalDay('referral') || userData.balances.referral <= 0 || !mtnNumber}
          >
            {userData.lastWithdrawalDates?.referral ? "Paid" : "Withdraw via MTN"}
          </button>
        </div>
      </div>

      <WithdrawalHistory history={userData.withdrawalHistory || []} />
    </div>
  );
};

const WithdrawalHistory = ({ history }) => (
  <div className="withdrawal-history">
    <h3>Previous Withdrawals</h3>
    {history.length === 0 ? (
      <p>No withdrawal history yet</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={index}>
              <td>{item.type}</td>
              <td>{formatXAF(item.amount)}</td>
              <td>{item.dateRequested?.toDate().toLocaleDateString()}</td>
              <td className={`status-${item.status}`}>
                {item.status}
                {item.status === 'paid' && ' ✓'}
              </td>
              <td className="payment-method">
                <img 
                  src="/mtn-logo.png" 
                  alt="MTN Mobile Money" 
                  className="mtn-logo" 
                />
                {item.phoneNumber}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default WithdrawalPage;