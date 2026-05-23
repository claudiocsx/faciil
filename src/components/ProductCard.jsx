import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Zap, Check, Upload, Plus, Clock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const ProductCard = ({ product, onAddToCart, onViewDetail, searchTerm = '', whatsappNumber }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [flashExpired, setFlashExpired] = useState(false);
 
  const productImage = [product.image, ...(product.images || [])].find(v => v && !v.startsWith('blob:')) || '';

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const isFlashSale = product.flashSale?.endsAt && new Date(product.flashSale.endsAt) > new Date() && !flashExpired;
  const flashDiscount = isFlashSale ? (product.flashSale?.discountPercent || 0) : 0;
  const flashPrice = isFlashSale ? product.price * (1 - flashDiscount / 100) : product.price;

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
    if (product.stock === 0) return;
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
      className={`group flex flex-col rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${justAdded ? 'md:animate-bounce' : ''}`}
      role="button"
      tabIndex={0}
      style={{ 
        backgroundColor: '#FFFFFF',
        border: `1px solid ${isFlashSale ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: isFlashSale ? '0 4px 20px -2px rgba(239,68,68,0.15)' : '0 4px 20px -2px rgba(26, 34, 56, 0.04)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetail(product)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetail(product); } }}
    >
      {/* Imagem */}
      <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
        {productImage ? (
          <img 
            src={productImage} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover ${isHovered ? 'md:scale-110 md:opacity-90 scale-100' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
            <Upload size={40} className="text-gray-300" />
          </div>
        )}
        
        <div className={`absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-80' : 'opacity-0'}`} />

        {/* Badges - Modernos */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10">
          {isFlashSale && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold flex items-center gap-1" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
              <Zap size={12} /> Relâmpago
            </span>
          )}
          {discount > 0 && !isFlashSale && (
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
          {product.comingSoon && (
            <span className="px-3 py-1 rounded-full text-xs font-black font-bold flex items-center gap-1" style={{ backgroundColor: '#3B8BB9', color: '#FFFFFF' }}>
              <Zap size={12} /> Em breve
            </span>
          )}
        </div>

        {/* Quick Add to Cart - Desktop: full button (aparece no hover) */}
        <div className={`absolute bottom-4 left-3 right-3 hidden md:block transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          {product.comingSoon ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const clean = whatsappNumber.replace(/\D/g, '');
                const msg = 'Ola! Quero reservar ' + product.name;
                window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(msg), '_blank');
              }}
              className="w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
            >
              Reservar
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: justAdded ? '#1A2238' : '#FFB347',
                color: justAdded ? '#FFFFFF' : '#1A2238',
              }}
            >
              {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
              {justAdded ? 'No Carrinho!' : 'Comprar'}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="relative p-2 sm:p-4 space-y-1 sm:space-y-2">
        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-1 right-1 sm:top-3 sm:right-3 p-1 sm:p-2 rounded-full backdrop-blur-md transition-all z-10"
          style={{
            color: liked ? '#EF4444' : '#64748B',
            backgroundColor: liked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.9)',
            border: liked ? 'none' : '1px solid rgba(255,255,255,0.3)'
          }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>
          {product.category}
        </span>

        <h3 className="font-bold text-xs sm:text-sm line-clamp-2 transition-colors" style={{ color: '#1A2238' }}>
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
                  size={12} 
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
            <span className="text-[10px] sm:text-xs" style={{ color: '#64748B' }}>({reviews})</span>
          )}
          {userRating > 0 && (
            <span className="text-[10px] font-medium" style={{ color: '#10B981' }}>✓</span>
          )}
        </div>

        {/* Price */}
        <div className="space-y-0.5 sm:space-y-1 pt-0.5 sm:pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {isFlashSale ? (
            <p className="text-[10px] sm:text-xs line-through" style={{ color: '#64748B' }}>
              De: R$ {product.price.toFixed(2)}
            </p>
          ) : product.originalPrice ? (
            <p className="text-[10px] sm:text-xs line-through" style={{ color: '#64748B' }}>
              R$ {product.originalPrice.toFixed(2)}
            </p>
          ) : null}
          <div className="flex items-baseline gap-2">
            {isFlashSale && (
              <p className="text-[10px] sm:text-xs font-bold" style={{ color: '#EF4444' }}>
                ⚡
              </p>
            )}
            <p className="text-base sm:text-2xl font-extrabold" style={{ color: '#1A2238' }}>
              R$ {isFlashSale ? flashPrice.toFixed(2) : product.price.toFixed(2)}
            </p>
          </div>
          <p className="text-[10px] sm:text-xs" style={{ color: '#64748B' }}>
            ou 3x de R$ {((isFlashSale ? flashPrice : product.price) / 3).toFixed(2)} sem juros
          </p>
          {isFlashSale && (
            <div className="flex items-center gap-1 mt-1">
              <CountdownTimer endsAt={product.flashSale.endsAt} compact onExpired={() => setFlashExpired(true)} />
            </div>
          )}
        </div>

        {/* Botão Comprar - Mobile */}
        {product.comingSoon ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const clean = whatsappNumber.replace(/\D/g, '');
              const msg = 'Ola! Quero reservar ' + product.name;
              window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(msg), '_blank');
            }}
            className="w-full mt-1 sm:mt-3 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 md:hidden"
            style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
          >
            Reservar
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full mt-1 sm:mt-3 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 md:hidden"
            style={{
              backgroundColor: '#FFB347',
              color: '#1A2238',
              opacity: product.stock === 0 ? 0.4 : 1
            }}
          >
            {justAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
            {justAdded ? 'No Carrinho!' : 'Comprar'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
