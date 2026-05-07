import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RotateCcw, Heart, Plus, Minus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Logo from './Logo';

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(v => v && !v.startsWith('blob:'));
  const productImages = allImages.length > 0 ? allImages.slice(0, 4) : [''];
  const availableStock = product.stock ?? 999;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const stars = product.rating || 4.5;
  const displayRating = userRating > 0 ? userRating : stars;

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % productImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);

  const handleRateProduct = (rating) => {
    setUserRating(rating);
    setRatingSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFDFD' }}>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 transition-colors hover:bg-black/5 p-2 rounded-lg"
              style={{ color: '#1A2238' }}
            >
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Voltar</span>
            </button>

            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-black text-lg hidden sm:block" style={{ color: '#1A2238' }}>faciil</span>
            </div>

            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full transition-all ${liked ? 'text-red-500' : 'hover:bg-black/5'}`}
              style={liked ? { backgroundColor: 'rgba(239,68,68,0.1)' } : { color: '#1A2238' }}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Gallery de Imagens */}
            <div className="relative" style={{ backgroundColor: '#F8FAFC' }}>
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg transition-all hover:bg-white"
                    >
                      <ChevronLeft size={20} style={{ color: '#1A2238' }} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg transition-all hover:bg-white"
                    >
                      <ChevronRight size={20} style={{ color: '#1A2238' }} />
                    </button>
                  </>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                      Novo
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FFB800', color: '#1A2238' }}>
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>
              
              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                        i === selectedImage ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ 
                        ringColor: i === selectedImage ? '#FFB347' : 'transparent',
                        border: i === selectedImage ? 'none' : '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info do Produto */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>
                  {product.category}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: '#1A2238' }}>
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => !ratingSubmitted && handleRateProduct(i + 1)}
                      className={`transition-transform ${!ratingSubmitted ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    >
                      <Star 
                        size={18} 
                        fill={i < displayRating ? '#FFB347' : 'none'} 
                        style={{ color: i < displayRating ? '#FFB347' : '#CBD5E1' }}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: '#1A2238' }}>{displayRating.toFixed(1)}</span>
                <span className="text-xs" style={{ color: '#94A3B8' }}>({product.reviews || 0} avaliações)</span>
                {ratingSubmitted && userRating > 0 && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>Obrigado!</span>
                )}
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-extrabold" style={{ color: '#1A2238' }}>
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>
                {product.originalPrice && (
                  <p className="text-sm line-through" style={{ color: '#94A3B8' }}>
                    De: R$ {product.originalPrice.toFixed(2)}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: availableStock > 10 ? '#10B981' : availableStock > 0 ? '#FFB347' : '#EF4444' 
                  }} 
                />
                <span className="text-sm font-medium" style={{ color: '#1A2238' }}>
                  {availableStock > 10 
                    ? 'Em estoque' 
                    : availableStock > 0 
                      ? `${availableStock} unidades disponíveis` 
                      : 'Esgotado'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold" style={{ color: '#1A2238' }}>Quantidade:</span>
                <div 
                  className="flex items-center gap-1 rounded-xl p-1"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    style={{ color: '#1A2238' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold" style={{ color: '#1A2238' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} 
                    disabled={quantity >= availableStock} 
                    className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                    style={{ color: '#1A2238' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, quantity);
                  setJustAdded(true);
                  setTimeout(() => setJustAdded(false), 2000);
                }}
                disabled={availableStock === 0}
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: justAdded ? '#10B981' : '#FFB347',
                  color: '#1A2238',
                  boxShadow: justAdded 
                    ? '0 4px 12px rgba(16,185,129,0.3)' 
                    : '0 4px 12px rgba(255,179,71,0.3)'
                }}
              >
                {justAdded ? (
                  <><Check size={18} /> Adicionado!</>
                ) : (
                  <><ShoppingCart size={18} /> Adicionar ao Carrinho</>
                )}
              </button>

              <div className="flex flex-wrap gap-4 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                {[
                  { icon: Truck, text: 'Frete grátis' },
                  { icon: Shield, text: '1 ano garantia' },
                  { icon: RotateCcw, text: '30 dias devolução' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                    <item.icon size={16} style={{ color: '#FFB347' }} />
                    <span style={{ color: '#1A2238' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
