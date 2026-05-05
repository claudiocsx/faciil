import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Zap, Check } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetail }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const stars = product.rating || 4.5;
  const reviews = product.reviews || 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div 
      className="group relative glass-card rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetail(product)}
    >
      {/* Imagem */}
      <div className="relative aspect-square bg-bg-elevated overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 opacity-90' : 'scale-100'}`}
        />
        
        <div className={`absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-80' : 'opacity-0'}`} />

        {/* Badges - Modernos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold flex items-center gap-1" style={{ backgroundColor: '#FFB800', boxShadow: '0 0 8px rgba(255,184,0,0.4)' }}>
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold flex items-center gap-1" style={{ backgroundColor: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }}>
              <Zap size={12} /> Novo
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold glass-card text-text-dim">
              Esgotado
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold" style={{ backgroundColor: '#FFB800', boxShadow: '0 0 8px rgba(255,184,0,0.4)' }}>
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
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-black ${
              justAdded ? 'bg-green-500 scale-105' : ''
            }`}
            style={{ 
              backgroundColor: justAdded ? '#10B981' : '#00E676',
              boxShadow: justAdded 
                ? '0 0 12px rgba(16,185,129,0.5)' 
                : '0 0 12px rgba(0,230,118,0.5), 0 0 24px rgba(0,230,118,0.2)'
            }}
          >
            {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
            {justAdded ? 'Adicionado!' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
          {product.category}
        </span>

        <h3 className="font-bold text-text-primary text-sm line-clamp-2 transition-colors hover:text-neon-cyan">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(stars) ? 'text-neon-amber fill-neon-amber' : 'text-text-dim'} 
              />
            ))}
          </div>
          {reviews > 0 && (
            <span className="text-xs text-text-dim">({reviews})</span>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1 pt-1 border-t border-border-subtle">
          {product.originalPrice && (
            <p className="text-xs text-text-dim line-through">
              R$ {product.originalPrice.toFixed(2)}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black" style={{ color: '#C6FF00' }}>
              R$ {product.price.toFixed(2)}
            </p>
          </div>
          <p className="text-xs text-text-dim">
            ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
