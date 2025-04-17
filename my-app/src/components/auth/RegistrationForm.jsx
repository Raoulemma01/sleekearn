import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import './AuthForms.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telephone: '',
    country: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[1-9]\d{1,14}$/.test(phone);
  const validatePassword = (password) => 
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const email = formData.email.trim();
    const telephone = formData.telephone.trim();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePhone(telephone)) {
      setError('Please enter a valid international phone number (e.g., +237612345678)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must contain at least 8 characters, including uppercase, lowercase, and numbers');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        formData.password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: formData.username.trim(),
        email: email,
        telephone: telephone,
        country: formData.country.trim(),
        referralCode: generateSecureReferralCode(),
        balances: { task: 0, referral: 0, total: 0 },
        previousBalances: { task: 0, referral: 0, total: 0 },
        referrals: [],
        completedTasks: {},
        notifications: [],
        paymentVerified: false,
        role: 'user',
        mtnNumber: '',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      navigate('/payment');
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecureReferralCode = () => {
    const array = new Uint8Array(6);
    window.crypto.getRandomValues(array);
    return 'SLK-' + Array.from(array, byte => 
      byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const handleFirebaseError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('This email is already registered');
        break;
      case 'auth/weak-password':
        setError('Password must be at least 8 characters with mixed case and numbers');
        break;
      case 'auth/network-request-failed':
        setError('Network error - please check your connection');
        break;
      default:
        setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create Account</h2>
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
            placeholder="+237612345678"
            required
          />
        </div>

        <div className="form-group">
          <label>Country:</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            required
          >
            <option value="">Select Country</option>
            <option value="cameroon">Cameroon</option>
            <option value="nigeria">Nigeria</option>
            <option value="ghana">Ghana</option>
          </select>
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="auth-links">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default RegistrationForm;