import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUIb4paB6oAYWEwvz0AsfPEKVlhg6zjRs",
  authDomain: "korea-history-steps.firebaseapp.com",
  projectId: "korea-history-steps",
  storageBucket: "korea-history-steps.firebasestorage.app",
  messagingSenderId: "393298453672",
  appId: "1:393298453672:web:3d1e9f54c404c2d41ece9d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
