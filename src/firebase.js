import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuCrS60VM76-vIKhGl3jTpI17VWbAfItQ",
  authDomain: "faciil-1ea11.firebaseapp.com",
  projectId: "faciil-1ea11",
  storageBucket: "faciil-1ea11.firebasestorage.app",
  messagingSenderId: "820274754016",
  appId: "1:820274754016:web:763314d500c19fc46d7b85"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
