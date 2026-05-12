import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Zap, Check, Upload, Plus } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetail, searchTerm = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const productImage = [product.image, ...(product.images || [])].find(v => v && !v.startsWith('blob:')) || '';

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const stars = product.rating || 4.5;
  const reviews = product.reviews || 0;
  const displayRating = userRating > 0 ? userRating : stars;

  const handleRate = (e, rating) => {
    e.stopPropagation();
    setUserRating(rating);
  };

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-400/30 text-white rounded px-0.5">{part}</mark> : part
    );
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    animateToCart(e);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const animateToCart = (e) => {
    const card = e.currentTarget.closest('[data-product-card]');
    const img = card?.querySelector('img');
    const cartIcon = document.querySelector('[data-cart-icon]');
    if (!img || !cartIcon) return;

    const clone = img.cloneNode();
    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    Object.assign(clone.style, {
      position: 'fixed',
      left: `${imgRect.left}px`,
      top: `${imgRect.top}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
      objectFit: 'cover',
      borderRadius: '12px',
      zIndex: '9999',
      pointerEvents: 'none',
      transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      margin: '0',
    });
    document.body.appendChild(clone);

    clone.getBoundingClientRect();

    clone.style.left = `${cartRect.left + cartRect.width / 2 - 20}px`;
    clone.style.top = `${cartRect.top + cartRect.height / 2 - 20}px`;
    clone.style.width = '40px';
    clone.style.height = '40px';
    clone.style.opacity = '0.4';
    clone.style.borderRadius = '50%';

    setTimeout(() => clone.remove(), 700);
  };

  return (
    <div 
      data-product-card
      className={`group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${justAdded ? 'animate-bounce' : ''}`}
      role="button"
      tabIndex={0}
      style={{ 
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: justAdded 
          ? '0 8px 30px rgba(255,179,71,0.5)' 
          : '0 4px 20px -2px rgba(26, 34, 56, 0.04)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetail(product)}
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
        {productImage ? (
          <img 
            src={productImage} 
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 opacity-90' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
            <Upload size={40} className="text-gray-300" />
          </div>
        )}
        
        <div className={`absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-80' : 'opacity-0'}`} />

        {/* Badges - Modernos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold flex items-center gap-1" style={{ backgroundColor: '#FFB800',  }}>
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold flex items-center gap-1" style={{ backgroundColor: '#FFB347',  }}>
              <Zap size={12} /> Novo
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold glass-card text-text-dim">
              Esgotado
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold" style={{ backgroundColor: '#FFB800',  }}>
              Últimas!
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            liked 
              ? 'text-red-500' 
              : 'bg-white/5 text-text-secondary hover:text-red-400 border border-white/10'
          }`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add to Cart - Mobile: + icon */}
        <div className="absolute bottom-3 right-3 md:hidden z-10">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 active:scale-90 shadow-lg"
            style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
          >
            {justAdded ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {/* Quick Add to Cart - Desktop: full button */}
        <div className="absolute bottom-4 left-3 right-3 hidden md:block">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              justAdded ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
            style={{ 
              backgroundColor: justAdded ? '#1A2238' : '#FFB347',
              color: justAdded ? '#FFFFFF' : '#1A2238',
              boxShadow: '0 4px 12px rgba(255,179,71,0.3)'
            }}
          >
            {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
            {justAdded ? 'No Carrinho!' : 'Comprar'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>
          {product.category}
        </span>

        <h3 className="font-bold text-sm line-clamp-2 transition-colors" style={{ color: '#1A2238' }}>
          {highlightText(product.name, searchTerm)}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 group">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                onClick={(e) => handleRate(e, i + 1)}
                className="transition-all hover:scale-125"
              >
                <Star 
                  size={14} 
                  fill={i < displayRating ? '#FFB347' : 'none'} 
                  style={{ 
                    color: i < displayRating ? '#FFB347' : '#CBD5E1',
                    transition: 'all 0.15s ease'
                  }}
                />
              </button>
            ))}
          </div>
          {reviews > 0 && (
            <span className="text-xs" style={{ color: '#64748B' }}>({reviews})</span>
          )}
          {userRating > 0 && (
            <span className="text-[10px] font-medium" style={{ color: '#10B981' }}>✓</span>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {product.originalPrice && (
            <p className="text-xs line-through" style={{ color: '#64748B' }}>
              R$ {product.originalPrice.toFixed(2)}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold" style={{ color: '#1A2238' }}>
              R$ {product.price.toFixed(2)}
            </p>
          </div>
          <p className="text-xs" style={{ color: '#64748B' }}>
            ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
