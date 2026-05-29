import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async (uid) => {
    const snap = await getDoc(doc(db, 'customers', uid));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  };

  const customerSignup = async (name, email, password, phone) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const data = { name, email, phone, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'customers', user.uid), data);
    setCustomer({ id: user.uid, ...data });
    return { id: user.uid, ...data };
  };

  const customerLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const customerLogout = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const data = await fetchCustomerData(firebaseUser.uid);
        if (data) setCustomer(data);
      } else {
        setCustomer(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{ customer, customerLogin, customerSignup, customerLogout, loading }}
    >
      {!loading && children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthProvider;
