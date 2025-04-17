import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { userData } = useAuth();

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} 
        onClick={onClose}
        role="button"
        aria-label="Close sidebar"
        tabIndex={0}
      />

      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        <div className="sidebar-content">
          <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
          <Link to="/tasks" onClick={onClose}>Tasks</Link>
          <Link to="/referrals" onClick={onClose}>Referrals</Link>
          <Link to="/withdraw" onClick={onClose}>Withdraw</Link>
          
          {(userData?.role === 'admin' || userData?.role === 'superadmin') && (
            <Link to="/admin" onClick={onClose} className="admin-link">
              Admin Panel
            </Link>
          )}

          <button 
            className="logout-btn"
            onClick={() => signOut(auth)}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;