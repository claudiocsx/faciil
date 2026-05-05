import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RotateCcw, Heart, Plus, Minus } from 'lucide-react';
import Logo from './Logo';

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const availableStock = product.stock || 999;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const stars = product.rating || 4.5;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFDFD' }}>
      <header className="border-b sticky top-0 z-40 backdrop-blur-xl" style={{ backgroundColor: 'rgba(5,5,5,0.8)', borderColor: 'rgba(59,139,185,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-text-secondary hover:text-neon-cyan transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Voltar</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="drop-shadow-[0_0_6px rgba(59,139,185,0.6)]">
                <Logo size={28} />
              </div>
              <span className="font-black text-lg text-text-primary hidden sm:block">Faciil</span>
            </div>

            <button
              onClick={() => setLiked(!liked)}
              className={`p-1.5 rounded-lg transition-all ${
                liked ? 'text-red-500' : 'hover:bg-white/5 text-text-dim'
              }`}
              style={liked ? { backgroundColor: 'rgba(239,68,68,0.1)' } : {}}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-bg-elevated" style={{ maxHeight: '400px' }}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FFB347' }}>
                  {product.category}
                </span>
                {product.isNew && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-black" style={{ backgroundColor: '#FFB347' }}>
                    Novo
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-black" style={{ backgroundColor: '#FFB800' }}>
                    -{discount}%
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-text-primary leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(stars) ? 'text-neon-amber fill-neon-amber' : 'text-text-dim'} />
                  ))}
                </div>
                <span className="text-xs font-bold text-text-primary">{stars}</span>
                <span className="text-xs text-text-dim">({product.reviews || 0})</span>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(138,168,46,0.05)', border: '1px solid rgba(138,168,46,0.15)' }}>
                {product.originalPrice && (
                  <p className="text-xs text-text-dim line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </p>
                )}
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black" style={{ color: '#FFB347' }}>
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-xs text-text-dim">
                  ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  availableStock > 10 ? 'bg-neon-green' : availableStock > 0 ? 'bg-neon-amber' : 'bg-red-500'
                }`} />
                <span className="text-xs font-medium text-text-secondary">
                  {availableStock > 10 
                    ? 'Em estoque' 
                    : availableStock > 0 
                      ? `${availableStock} disponíveis` 
                      : 'Esgotado'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-text-secondary">Qtd:</span>
                <div className="flex items-center gap-2 glass-card rounded-lg p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-text-secondary">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-text-primary">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} disabled={quantity >= availableStock} className="p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, quantity);
                }}
                disabled={availableStock === 0}
                className="relative z-10 w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#1A2238',
                  color: '#000'
                }}
              >
                <ShoppingCart size={18} /> Adicionar ao Carrinho
              </button>

              <div className="flex flex-wrap gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {[
                  { icon: Truck, text: 'Frete grátis' },
                  { icon: Shield, text: '12 meses garantia' },
                  { icon: RotateCcw, text: '30 dias devolução' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-text-dim">
                    <item.icon size={14} style={{ color: '#FFB347' }} />
                    <span>{item.text}</span>
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
