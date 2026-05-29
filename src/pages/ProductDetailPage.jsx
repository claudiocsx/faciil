import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import ProductDetail from '../components/ProductDetail';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'whatsapp'));
        if (snap.exists()) setWhatsapp(snap.data().number);
      } catch (err) {
        console.error('Erro ao carregar WhatsApp:', err);
      }
    };
    load();
  }, []);

  const product = location.state || products.find((p) => p.id === id);

  if (!product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FDFDFD' }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Produto não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-black rounded-xl font-bold"
            style={{ backgroundColor: '#FFB347' }}
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  const productUrl = `https://faciil.vercel.app/produto/${product.id}`;
  const productImage = product.image || 'https://faciil.vercel.app/og-image.png';
  const price = product.price?.toFixed(2) || '0.00';
  const originalPrice = product.originalPrice?.toFixed(2);

  return (
    <>
      <Helmet>
        <title>{product.name} - Faciil</title>
        <meta
          name="description"
          content={`Comprar ${product.name} por R$ ${price}. ${product.category} com entrega via Uber Flash no Crato-CE.`}
        />
        <meta
          name="keywords"
          content={`${product.name}, ${product.category}, acessorios tech, Faciil`}
        />
        <meta property="og:title" content={`${product.name} - Faciil`} />
        <meta
          property="og:description"
          content={`Por R$ ${price}${originalPrice ? ` (de R$ ${originalPrice})` : ''} - ${product.category}`}
        />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={productImage} />
        <meta property="product:price:amount" content={price} />
        <meta property="product:price:currency" content="BRL" />
        <meta
          property="product:availability"
          content={product.stock > 0 ? 'in stock' : 'out of stock'}
        />
        <meta name="twitter:title" content={`${product.name} - Faciil`} />
        <meta name="twitter:description" content={`Por R$ ${price} - ${product.category}`} />
        <meta name="twitter:image" content={productImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: `${product.name} - ${product.category}`,
            image: productImage,
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: 'BRL',
              availability:
                product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: 'Faciil' },
            },
            brand: { '@type': 'Brand', name: 'Faciil' },
            category: product.category,
          })}
        </script>
      </Helmet>
      <WhatsAppFloat number={whatsapp} />
      <ProductDetail
        product={product}
        onBack={() => navigate('/')}
        onAddToCart={addToCart}
        whatsappNumber={whatsapp}
        shareUrl={productUrl}
      />
    </>
  );
};

export default ProductDetailPage;
