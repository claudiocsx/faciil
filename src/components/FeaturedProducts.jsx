import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const FeaturedProducts = ({ products, onAddToCart, onViewDetail, whatsappNumber }) => {
  const scrollRef = useRef(null);
  const featured = products.filter(p => p.featured && !p.comingSoon && p.stock !== 0);

  if (featured.length === 0) return null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-6 sm:py-8" style={{ backgroundColor: '#F5F3F0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#FFB347' }}>
              <Star size={14} fill="#1A2238" style={{ color: '#1A2238' }} />
            </div>
            <h2 className="text-sm sm:text-lg font-black" style={{ color: '#1A2238' }}>Produtos em Destaque</h2>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => scroll('left')} className="p-1.5 rounded-lg transition-all hover:bg-black/10" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <ChevronLeft size={18} style={{ color: '#1A2238' }} />
            </button>
            <button onClick={() => scroll('right')} className="p-1.5 rounded-lg transition-all hover:bg-black/10" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <ChevronRight size={18} style={{ color: '#1A2238' }} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-4 px-4">
          {featured.map(p => {
            const img = p.image || p.images?.[0];
            const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
            return (
              <div
                key={p.id}
                onClick={() => onViewDetail(p)}
                className="flex-shrink-0 snap-start w-[65vw] sm:w-[280px] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 12px rgba(255,179,71,0.15)' }}
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
                  {img && !img.startsWith('blob:') ? (
                    <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
                      <Star size={32} style={{ color: '#CBD5E1' }} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                      <Star size={10} fill="#1A2238" /> Destaque
                    </span>
                    {discount > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black" style={{ backgroundColor: '#FFB800', color: '#1A2238' }}>
                        -{discount}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>{p.category}</p>
                  <h3 className="font-bold text-xs sm:text-sm line-clamp-2" style={{ color: '#1A2238' }}>{p.name}</h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <p className="text-base sm:text-lg font-extrabold" style={{ color: '#1A2238' }}>R$ {p.price?.toFixed(2)}</p>
                    {p.originalPrice && (
                      <p className="text-[10px] line-through" style={{ color: '#94A3B8' }}>R$ {p.originalPrice.toFixed(2)}</p>
                    )}
                  </div>
                  {p.comingSoon ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const clean = whatsappNumber.replace(/\D/g, '');
                        const msg = 'Ola! Quero reservar ' + p.name;
                        window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(msg), '_blank');
                      }}
                      className="w-full mt-1.5 py-2 rounded-lg font-bold text-xs transition-all hover:opacity-90"
                      style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                    >
                      Reservar
                    </button>
                  ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                    disabled={p.stock === 0}
                    className="w-full mt-1.5 py-2 rounded-lg font-bold text-xs transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                  >
                    {p.stock === 0 ? 'Esgotado' : 'Adicionar'}
                  </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
