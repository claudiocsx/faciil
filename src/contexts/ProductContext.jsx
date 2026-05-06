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
    try {
      console.log('addProduct called:', product?.name);
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: new Date().toISOString()
      });
      console.log('Produto salvo com ID:', docRef.id);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      throw error;
    }
  };

  const removeProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const updateProduct = async (id, data) => {
    try {
      await updateDoc(doc(db, 'products', id), data);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, removeProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};
