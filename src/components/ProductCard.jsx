import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Zap, Check } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetail, searchTerm = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const stars = product.rating || 4.5;
  const reviews = product.reviews || 0;

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
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div 
      className="group relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{ 
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 4px 20px -2px rgba(26, 34, 56, 0.04)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetail(product)}
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 opacity-90' : 'scale-100'}`}
        />
        
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

        {/* Quick Add to Cart */}
        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
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
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>
          {product.category}
        </span>

        <h3 className="font-bold text-sm line-clamp-2 transition-colors" style={{ color: '#1A2238' }}>
          {highlightText(product.name, searchTerm)}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.floor(stars) ? '#FFB347' : 'none'} 
                style={{ color: i < Math.floor(stars) ? '#FFB347' : '#CBD5E1' }}
              />
            ))}
          </div>
          {reviews > 0 && (
            <span className="text-xs" style={{ color: '#94A3B8' }}>({reviews})</span>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {product.originalPrice && (
            <p className="text-xs line-through" style={{ color: '#94A3B8' }}>
              R$ {product.originalPrice.toFixed(2)}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold" style={{ color: '#1A2238' }}>
              R$ {product.price.toFixed(2)}
            </p>
          </div>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
