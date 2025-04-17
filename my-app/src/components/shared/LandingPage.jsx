// src/components/shared/LandingPage.jsx
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Create this CSS file

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="landing-title">Welcome to SleekEarn</h1>
        <p className="landing-subtitle">Earn money by completing simple tasks</p>
      </header>

      <div className="landing-content">
        <div className="landing-card">
          <h2>New Users</h2>
          <p>Create an account to get started</p>
          <Link to="/register" className="landing-button primary">
            Sign Up Now
          </Link>
        </div>

        <div className="landing-card">
          <h2>Existing Users</h2>
          <p>Access your dashboard</p>
          <Link to="/login" className="landing-button secondary">
            Login
          </Link>
        </div>
      </div>

      <footer className="landing-footer">
        <p>Already have an account? <Link to="/login" className="text-link">Login here</Link></p>
        <p>New user? <Link to="/register" className="text-link">Register now</Link></p>
      </footer>
    </div>
  );
};

export default LandingPage;