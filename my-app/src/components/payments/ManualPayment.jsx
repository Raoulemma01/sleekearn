import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import './paymentpage.css';

const ManualPayment = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const ussdCode = '*126*14*653562282*2300#';

  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '_').replace(/\s+/g, '_');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(ussdCode);
    setMessage('USSD code copied! Dial it on your phone to complete payment.');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!file) {
      setError('Please upload payment proof');
      return;
    }

    if (!currentUser?.uid) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, or PDF.');
      }

      // Sanitize filename and create reference
      const sanitized = sanitizeFilename(file.name);
      const filename = `payment_${Date.now()}_${sanitized}`;
      const storageRef = ref(storage, `payments/${currentUser.uid}/${filename}`);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          throw new Error(`Upload failed: ${error.message}`);
        },
        async () => {
          // Get download URL after upload
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // Create payment record
          await addDoc(collection(db, 'pendingPayments'), {
            userId: currentUser.uid,
            proof: url,
            status: 'pending',
            amount: 2300,
            date: new Date(),
            createdAt: serverTimestamp(),
            fileName: filename,
            fileType: file.type
          });

          setMessage('Payment submitted! Admin will verify within 24 hours.');
          setFile(null);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message.includes('permission-denied') 
        ? 'Submission failed: You don\'t have permission' 
        : error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-warning">
        Please login to access this page
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h2>Complete Payment (2,300 XAF)</h2>
      
      <div className="payment-steps">
        <div className="step">
          <h3>1. Make Payment</h3>
          <button 
            onClick={copyCode} 
            className="ussd-btn"
            type="button"
            aria-label="Copy USSD code"
          >
            Copy USSD: {ussdCode}
          </button>
          <p>Dial this code on your phone to complete payment</p>
        </div>

        <div className="step">
          <h3>2. Upload Proof</h3>
          <form onSubmit={handleSubmit}>
            <div className="file-upload-container">
              <label>
                Select File
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*,application/pdf"
                  required
                  disabled={loading}
                  aria-label="Select payment proof file"
                />
              </label>
              {file && (
                <div className="file-info">
                  <span>{file.name}</span>
                  <span>({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                  {uploadProgress}%
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || uploadProgress > 0}
              className={loading ? 'loading' : ''}
              aria-live="polite"
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  <span role="status">Uploading...</span>
                </>
              ) : 'Submit Proof'}
            </button>
          </form>
        </div>
      </div>

      {message && (
        <div className="message success" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="message error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ManualPayment;