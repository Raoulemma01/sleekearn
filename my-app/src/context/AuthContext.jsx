import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children, value }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError('');
        
        if (user) {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: user.email,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              status: "active",
              role: "user",
              paymentVerified: false,
              balances: {
                task: 0,
                referral: 0,
                total: 0
              }
            });
            // Refresh user data after creation
            const newUserDoc = await getDoc(userRef);
            setUserData(newUserDoc.data());
          } else {
            setUserData(userDoc.data());
          }
        } else {
          setUserData(null);
        }
        
        setCurrentUser(user);
      } catch (error) {
        console.error("Auth error:", error);
        setError(error.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const contextValue = value || {
    currentUser,
    userData,
    loading,
    error,
    setUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}