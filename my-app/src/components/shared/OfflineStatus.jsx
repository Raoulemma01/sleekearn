import React from 'react';
import './OfflineStatus.css';

const OfflineStatus = () => {
  return (
    <div className="offline-status">
      <div className="offline-content">
        <span className="offline-icon">⚠️</span>
        <span>You are currently offline. Some features may be limited.</span>
      </div>
    </div>
  );
};

export default OfflineStatus;