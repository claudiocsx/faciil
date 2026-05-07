import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBxVQuTfQLfkBxKCe6-2tIO7XmwxVaYCss",
  authDomain: "faciil-da83b.firebaseapp.com",
  projectId: "faciil-da83b",
  storageBucket: "faciil-da83b.firebasestorage.app",
  messagingSenderId: "129411033308",
  appId: "1:129411033308:web:5815039bc9c4827c51ac19"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
