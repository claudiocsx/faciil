import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta mudanças em tempo real na coleção de produtos
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product) => {
    console.log('addProduct chamado com:', product?.name, product?.image ? 'tem imagem' : 'SEM IMAGEM');
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: new Date().toISOString()
    });
  };

  const removeProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const updateProduct = async (id, data) => {
    await updateDoc(doc(db, 'products', id), data);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, removeProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};
