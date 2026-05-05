import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import ProductDetail from '../components/ProductDetail';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const product = location.state || products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050505' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Produto não encontrado</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 text-black rounded-xl font-bold" style={{ backgroundColor: '#3B8B9' }}>
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      onBack={() => navigate('/')}
      onAddToCart={addToCart}
    />
  );
};

export default ProductDetailPage;
