// services/notificationService.js
import { db } from '../../../firebase/config';
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  updateDoc,
  doc
} from 'firebase/firestore';

export const addNotification = async (userId, { message, type, icon = null, link = null }) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationsRef, {
      message,
      type,
      icon,
      link,
      read: false,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

export const getNotifications = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

export const markAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};