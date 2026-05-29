import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Checkout from '../components/Checkout';

const CheckoutPage = ({ onComplete }) => {
  const navigate = useNavigate();
  const { cart } = useCart();

  return <Checkout cart={cart} onBack={() => navigate('/')} onComplete={onComplete} />;
};

export default CheckoutPage;
