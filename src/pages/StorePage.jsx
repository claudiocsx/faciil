import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import Storefront from '../components/Storefront';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const WHATSAPP_NUMBER = '5511999999999';

const StorePage = () => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { products } = useProducts();

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

  return (
    <Storefront
      products={products}
      cart={cart}
      onAddToCart={addToCart}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
      onViewDetail={(product) => navigate(`/produto/${product.id}`, { state: product })}
      onOrders={() => navigate('/pedidos')}
      whatsappNumber={WHATSAPP_NUMBER}
      onSaveOrder={handleSaveOrder}
    />
  );
};

export default StorePage;
