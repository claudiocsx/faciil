import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import Storefront from '../components/Storefront';
import LoadingScreen from '../components/LoadingScreen';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const StorePage = () => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { products } = useProducts();
  const [whatsapp, setWhatsapp] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'whatsapp'));
        if (snap.exists()) setWhatsapp(snap.data().number);
      } catch (err) {
        console.error('Erro ao carregar WhatsApp:', err);
      }
      setLoaded(true);
    };
    load();
  }, []);

  const handleSaveOrder = async (orderData) => {
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending'
      });
      await addDoc(collection(db, 'notifications'), {
        title: 'Novo Pedido',
        message: `${orderData.customerName} fez um pedido de R$ ${orderData.total.toFixed(2)}`,
        read: false,
        createdAt: new Date().toISOString()
      });
      clearCart();
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
    }
  };

  if (!loaded) {
    return <LoadingScreen message="Preparando loja..." />;
  }

  return (
    <Storefront
      products={products}
      cart={cart}
      onAddToCart={addToCart}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
      onViewDetail={(product) => navigate(`/produto/${product.id}`, { state: product })}
      onOrders={() => navigate('/pedidos')}
      whatsappNumber={whatsapp}
      onSaveOrder={handleSaveOrder}
    />
  );
};

export default StorePage;
