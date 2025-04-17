import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import Sidebar from './Sidebar';
import NotificationBox from './NotificationBox';
import ReferralLink from './ReferralLink';
import BalanceBox from './BalanceBox';
import './Dashboard.css';

const formatMoney = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' XAF';
};

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.uid) return;

        // Get user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }
        setUserData(userDoc.data());

        // Get notifications from user subcollection
        const notificationsQuery = query(
          collection(db, "users", user.uid, "notifications"),
          where("read", "==", false)
        );
        const snapshot = await getDocs(notificationsQuery);
        setNotifications(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        })));

      } catch (err) {
        console.error("Error loading data:", err);
        setDataError(err.message);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!user) return <div className="auth-required">Please login</div>;

  return (
    <div className="dashboard">
      <header>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <h1>SleekEarn</h1>
      </header>
      
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="content">
        {dataError && (
          <div className="error-message">
            Error loading data: {dataError}
          </div>
        )}

        <h2>Welcome, {user.email}</h2>
        
        <div className="balances">
          <BalanceBox 
            title="Task Balance" 
            amount={formatMoney(userData?.balances?.task)} 
          />
          <BalanceBox 
            title="Referral Balance" 
            amount={formatMoney(userData?.balances?.referral)} 
          />
          <BalanceBox 
            title="Total Balance" 
            amount={formatMoney(userData?.balances?.total)} 
          />
        </div>

        <NotificationBox notifications={notifications} />
        
        {userData?.referralCode && (
          <ReferralLink 
            userId={user.uid} 
            referralCode={userData.referralCode} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;