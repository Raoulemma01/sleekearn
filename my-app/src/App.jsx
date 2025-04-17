import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Components
import LandingPage from './components/shared/LandingPage';
import RegistrationForm from './components/auth/RegistrationForm';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/dashboard/Dashboard';
import ManualPayment from './components/payments/ManualPayment';
import AdminPanel from './components/dashboard/AdminPanel';
import WaitingVerification from './components/shared/WaitingVerification';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PaymentRoute from './components/auth/PaymentRoute';
import VerifiedRoute from './components/auth/VerifiedRoute';
import TaskSystem from './components/TaskSystem';
import ReferralSystem from './components/ReferralSystem';
import WithdrawalPage from './components/payments/WithdrawalPage';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />

            {/* Payment verification flow */}
            <Route element={<PaymentRoute />}>
              <Route path="/payment" element={<ManualPayment />} />
              <Route path="/waiting-verification" element={<WaitingVerification />} />
            </Route>

            {/* Main dashboard (protected) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Verified user routes */}
            <Route element={<VerifiedRoute />}>
              <Route path="/tasks" element={<TaskSystem />} />
              <Route path="/referrals" element={<ReferralSystem />} />
              <Route path="/withdraw" element={<WithdrawalPage />} />
            </Route>

            {/* Fallback routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;