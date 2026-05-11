import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  };

  const signup = async (email, password, name, role = 'vendedor') => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });
    
    // Salvar dados no Firestore
    await setDoc(doc(db, 'users', newUser.uid), {
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    });

    return { id: newUser.uid, name, email, role };
  };

  const login = async (email, password) => {
    const { user: loggedUser } = await signInWithEmailAndPassword(auth, email, password);
    // O onAuthStateChanged vai lidar com a busca dos dados
    return loggedUser.uid;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // No user document found in Firestore - this is not an admin user
            setUser(null);
          }
        } catch {
          // Error fetching user data - treat as non-admin
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { user, login, logout, signup, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
