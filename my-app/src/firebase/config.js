import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyDIMx2hn-3kFm8TsGuaBzfd-GD1E7h-gHg",
  authDomain: "sleekearn.firebaseapp.com",
  projectId: "sleekearn",
  storageBucket: "sleekearn.appspot.com",
  messagingSenderId: "277416930120",
  appId: "1:277416930120:web:2a7ce8dce5bbd2a79ca17d",
  measurementId: "G-FPYEMYNRTL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: false // Disabled for production
});
const storage = getStorage(app);
const perf = getPerformance(app);

// Production-optimized services
const safeFirebase = {
  app,
  auth,
  db,
  storage,
  perf,
  getCurrentUser: async () => {
    try {
      await auth.authStateReady();
      return auth.currentUser;
    } catch (error) {
      console.error("Auth state error:", error);
      return null;
    }
  }
};

export default safeFirebase;
export { app, auth, db, storage, perf };