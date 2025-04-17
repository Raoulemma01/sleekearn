import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, updateDoc, doc, increment } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { addNotification } from '../../components/dashboard/services/notificationService';
import Sidebar from './Sidebar';
import './AdminPanel.css';

const AdminPanel = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userData || !['admin', 'superadmin'].includes(userData.role)) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const paymentsQuery = query(
          collection(db, 'pendingPayments'),
          where('status', '==', 'pending')
        );
        const usersQuery = query(collection(db, 'users'));
        
        const [paymentsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(paymentsQuery),
          getDocs(usersQuery)
        ]);

        setPendingPayments(paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate()
        })));

        setUsers(usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })));

      } catch (err) {
        setError('Failed to load admin data. Please check console for details.');
        console.error('Admin data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData, navigate]);

  const handleVerifyPayment = async (paymentId, userId) => {
    try {
      // Update payment status
      await updateDoc(doc(db, 'pendingPayments', paymentId), {
        status: 'verified',
        verifiedBy: userData?.uid,
        verifiedAt: new Date()
      });

      // Update user status and add referral bonus
      await updateDoc(doc(db, 'users', userId), {
        paymentVerified: true,
        'balances.referral': increment(500),
        'balances.total': increment(500)
      });

      // Send verification notification
      await addNotification(userId, {
        message: 'Payment verified! Account activated 🎉',
        type: 'payment',
        icon: '✅'
      });

      setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
      
    } catch (err) {
      setError('Payment verification failed: ' + err.message);
      console.error('Verification error:', err);
    }
  };

  if (!userData || !['admin', 'superadmin'].includes(userData.role)) {
    return null;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      
      <div className="admin-content">
        <h1>Administration Panel</h1>
        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading admin data...</div>
        ) : (
          <>
            <section className="payment-verification-section">
              <h2>Pending Payments ({pendingPayments.length})</h2>
              <div className="payment-grid">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="payment-card">
                    <img src={payment.proof} alt="Payment proof" />
                    <div className="payment-details">
                      <p>User: {payment.userId}</p>
                      <p>Amount: 2,300 XAF</p>
                      <button onClick={() => handleVerifyPayment(payment.id, payment.userId)}>
                        Approve Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="user-management-section">
              <h2>User Accounts ({users.length})</h2>
              <div className="user-table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.paymentVerified ? 'verified' : 'pending'}`}>
                            {user.paymentVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>{(user.balances?.total || 0).toLocaleString()} XAF</td>
                        <td>
                          <Link to={`/user/${user.id}`} className="manage-link">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;