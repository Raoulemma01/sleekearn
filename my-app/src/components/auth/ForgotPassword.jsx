import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './AuthForms.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <h2>Password Reset</h2>
      {message && <div className="auth-success">{message}</div>}
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email"
          required
        />
        <button disabled={loading} type="submit">
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
      
      <div className="auth-footer-links">
        <p><Link to="/login">Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;