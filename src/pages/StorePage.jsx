import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import Storefront from '../components/Storefront';
import LoadingScreen from '../components/LoadingScreen';
import { addDoc, collection, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
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
      const stockUpdates = orderData.items.map((item) =>
        updateDoc(doc(db, 'products', item.id), { stock: increment(-item.quantity) })
      );
      await Promise.all(stockUpdates);
      clearCart();
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
    }
  };

  if (!loaded) {
    return <LoadingScreen message="Preparando loja..." />;
  }

  return (
    <>
      <Helmet>
        <title>Faciil - Acessórios de Tecnologia | Entrega via Uber Flash</title>
        <meta name="description" content="Acessórios de tecnologia com entrega rápida via Uber Flash no Crato-CE. Smartwatches, fones Bluetooth, carregadores, cabos, capas e películas com o melhor preço." />
        <meta name="keywords" content="acessórios tech, tecnologia, smartwatches, fones bluetooth, carregadores, capas celular, películas, Uber Flash, Crato, Ceará, loja online" />
        <meta property="og:title" content="Faciil - Acessórios de Tecnologia" />
        <meta property="og:description" content="Acessórios tech com entrega via Uber Flash no Crato-CE. Smartwatches, fones, carregadores e mais." />
        <meta property="og:url" content="https://faciil.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Faciil - Acessórios de Tecnologia" />
        <meta name="twitter:description" content="Acessórios tech com entrega via Uber Flash no Crato-CE." />
      </Helmet>
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
    </>
  );
};

export default StorePage;
