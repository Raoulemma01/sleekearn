// src/components/dashboard/NotificationBox.jsx
import { useEffect, useState } from 'react';
import { getNotifications } from './services/notificationService';

const NotificationBox = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Track mounted state to prevent memory leaks

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (userId) {
          const data = await getNotifications(userId);
          if (isMounted) setNotifications(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load notifications');
          console.error('Notification fetch error:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="notifications">
        <h3>Notifications</h3>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications">
        <h3>Notifications</h3>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      {notifications.length > 0 ? (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <p className="notification-message">
                  {notification.icon && (
                    <span className="notification-icon">{notification.icon}</span>
                  )}
                  {notification.message}
                </p>
                <div className="notification-meta">
                  <span className="notification-time">
                    {notification.timestamp?.toDate().toLocaleString()}
                  </span>
                  {notification.link && (
                    <a href={notification.link} className="notification-link">
                      View
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-notifications">No notifications yet</p>
      )}
    </div>
  );
};

export default NotificationBox;