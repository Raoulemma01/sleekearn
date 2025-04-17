import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      // Get fresh user data from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
      
      // Update context with latest user data
      setUserData(userDoc.data());
      
      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error) => {
    let message = 'Login failed. Please try again.';
    
    switch(error.code) {
      case 'auth/invalid-credential':
        message = 'Invalid email/password combination';
        break;
      case 'auth/too-many-requests':
        message = 'Account temporarily locked - try again later';
        break;
      case 'auth/user-disabled':
        message = 'Account disabled - contact support';
        break;
      case 'auth/network-request-failed':
        message = 'Network error - check your connection';
        break;
      default:
        message = error.message || 'Authentication failed';
    }
    
    setError(message);
    console.error('Login error:', error);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Account Login</h2>
        
        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="example@domain.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              placeholder="••••••••"
              minLength="8"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
            aria-label={loading ? 'Signing in...' : 'Sign in'}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register">Create New Account</Link>
          <Link to="/forgot-password">Reset Password</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;