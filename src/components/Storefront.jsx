import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, SlidersHorizontal, ChevronDown, ClipboardList, Package, Loader2, ArrowUp, ChevronLeft, ChevronRight, Tag, Percent } from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import Toast from './Toast';
import Logo from './Logo';
import ProductSkeleton from './ProductSkeleton';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const TECH_CATEGORIES = ['Tudo', 'Smartwatches', 'Fones Bluetooth', 'Carregadores', 'Cabos', 'Capas', 'Películas'];

const CAROUSEL_OFFERS = [
  { id: 1, title: 'Smartwatch Pro', subtitle: '30% OFF', image: 'https://images.unsplash.com/photo-1546868831-d1be1c463959?auto=format&fit=crop&w=400&q=80', link: '#products-section' },
  { id: 2, title: 'Fone Bluetooth', subtitle: '25% OFF', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80', link: '#products-section' },
  { id: 3, title: 'Carregador Turbo', subtitle: '20% OFF', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80', link: '#products-section' },
  { id: 4, title: 'Capa Premium', subtitle: '15% OFF', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80', link: '#products-section' },
];

const CAROUSEL_COUPONS = [
  { id: 1, code: 'FACIIL10', discount: '10% OFF', color: '#1A2238' },
  { id: 2, code: 'PRIMEIRA', discount: '15% OFF', color: '#FFB347' },
  { id: 3, code: 'TECNOLOGIA', discount: '20% OFF', color: '#1A2238' },
  { id: 4, code: 'NOVIDADE', discount: 'R$ 30 OFF', color: '#FFB347' },
];

const Storefront = ({ products, cart, onAddToCart, onUpdateQuantity, onRemoveItem, onViewDetail, onOrders, onAdmin, whatsappNumber, onSaveOrder }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [sortBy, setSortBy] = useState('featured');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentCarousel, setCurrentCarousel] = useState(0);
  const [bannerOffers, setBannerOffers] = useState([]);
  const [bannerCoupons, setBannerCoupons] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const offersSnap = await getDocs(collection(db, 'banners_offers'));
      const couponsSnap = await getDocs(collection(db, 'banners_coupons'));
      setBannerOffers(offersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBannerCoupons(couponsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Erro ao carregar banners:', err);
    }
    setBannersLoading(false);
  };

  const getCarouselOffers = () => bannerOffers.length > 0 ? bannerOffers : CAROUSEL_OFFERS;
  const getCarouselCoupons = () => bannerCoupons.length > 0 ? bannerCoupons : CAROUSEL_COUPONS;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextCarousel = () => {
    const total = getCarouselOffers().length + getCarouselCoupons().length;
    setCurrentCarousel((prev) => (prev + 1) % total);
  };

  const prevCarousel = () => {
    const total = getCarouselOffers().length + getCarouselCoupons().length;
    setCurrentCarousel((prev) => (prev - 1 + total) % total);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p =>
      (selectedCategory === 'Tudo' || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen grid-bg" style={{ backgroundColor: '#FDFDFD' }}>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        whatsappNumber={whatsappNumber}
        onSaveOrder={onSaveOrder}
      />

      {/* Delivery Banner */}
      <div className="py-2 text-center text-xs font-semibold relative overflow-hidden" style={{ backgroundColor: 'rgba(90,158,90,0.08)', color: 'var(--color-neon-green)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span>🛵 Entregas via Uber Flash em toda a cidade</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Retirada grátis no local disponível</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo Faciil Original */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Logo size={22} />
              <span className="font-black text-xl tracking-tight" style={{ color: '#1A2238' }}>fac<span style={{ color: '#FFB347', letterSpacing: '-1px' }}>ii</span>l</span>
            </div>

            {/* Busca & Carrinho */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#4A5568' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB347'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.04)'}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOrders && (
                <button
                  onClick={onOrders}
                  className="hidden sm:flex items-center gap-2 p-2.5 rounded-xl transition-all hover:bg-black/5"
                  style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <ClipboardList size={18} style={{ color: '#1A2238' }} />
                  <span className="text-xs font-medium" style={{ color: '#1A2238' }}>Pedidos</span>
                </button>
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl transition-all hover:bg-black/5"
                style={{ border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <ShoppingCart size={20} style={{ color: '#1A2238' }} />
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFB347' }}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Carousel Ofertas & Cupons */}
      <section className="py-4 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#1A2238', minHeight: '280px' }}>
            <div className="flex items-center h-full">
              {/* Navigation Left */}
              <button onClick={prevCarousel} className="absolute left-2 z-10 p-2 rounded-full hover:bg-white/10 transition-all">
                <ChevronLeft size={20} className="text-white" />
              </button>
              
              {/* Carousel Content */}
              <div className="w-full overflow-hidden px-12">
                <div 
                  className="flex transition-transform duration-500" 
                  style={{ transform: `translateX(-${currentCarousel * 100}%)` }}
                >
                  {/* Ofertas */}
                  {bannersLoading ? (
                    <div className="w-full flex-shrink-0 py-8 text-center text-white">
                      <Loader2 className="animate-spin w-6 h-6 mx-auto" style={{ color: '#FFB347' }} />
                    </div>
                  ) : (
                    <>
                      {getCarouselOffers().map((offer) => (
                        <div key={`offer-${offer.id}`} className="w-full flex-shrink-0 py-6">
                          <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-3" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                                <Tag size={10} />
                                Oferta
                              </div>
                              <h2 className="text-xl md:text-3xl font-bold text-white mb-1">{offer.title}</h2>
                              <p className="text-lg md:text-2xl font-bold" style={{ color: '#FFB347' }}>{offer.subtitle}</p>
                              <button 
                                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="mt-3 px-4 py-2 rounded-xl font-bold text-xs transition-all" 
                                style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                              >
                                Ver Oferta
                              </button>
                            </div>
                            <div className="flex justify-center">
                              <img src={offer.image} alt={offer.title} className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover" />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Cupons */}
                      {getCarouselCoupons().map((coupon) => (
                        <div key={`coupon-${coupon.id}`} className="w-full flex-shrink-0 py-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-3" style={{ backgroundColor: coupon.color || '#FFB347', color: '#1A2238' }}>
                              <Percent size={10} />
                              Cupom
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-1">{coupon.code}</h2>
                            <p className="text-xl md:text-3xl font-bold" style={{ color: '#FFB347' }}>{coupon.discount}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(coupon.code); setToastVisible(true); setToastMessage(`Cupom ${coupon.code} copiado!`); setTimeout(() => setToastVisible(false), 3000); }}
                              className="mt-3 px-4 py-2 rounded-xl font-bold text-xs transition-all" 
                              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              {/* Navigation Right */}
              <button onClick={nextCarousel} className="absolute right-2 z-10 p-2 rounded-full hover:bg-white/10 transition-all">
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 py-3">
              {[...Array(getCarouselOffers().length + getCarouselCoupons().length)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCarousel(i)}
                  className={`h-1.5 rounded-full transition-all ${i === currentCarousel ? 'w-6' : 'w-1.5'}`}
                  style={{ backgroundColor: i === currentCarousel ? '#FFB347' : 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-md" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
              >
                <SlidersHorizontal size={16} style={{ color: '#FFB347' }} />
                {selectedCategory}
                <ChevronDown size={14} style={{ color: '#94A3B8' }} />
              </button>
              
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-40 border" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                  {TECH_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5"
                      style={{ color: selectedCategory === cat ? '#FFB347' : '#1A2238' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238', appearance: 'none' }}
              >
                <option value="featured">Destaques</option>
                <option value="newest">Novidades</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name">A-Z</option>
              </select>
            </div>
          </div>

          {/* Filtros Ativos */}
          {(selectedCategory !== 'Tudo') && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm" style={{ color: '#94A3B8' }}>Filtros:</span>
              {selectedCategory !== 'Tudo' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(255,179,71,0.1)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.2)' }}>
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Tudo')} className="hover:text-black ml-1 font-bold">×</button>
                </span>
              )}
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('Tudo'); }}
                className="text-xs underline transition-colors"
                style={{ color: '#94A3B8' }}
              >
                Limpar todos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Filtros Ativos */}
        {(selectedCategory !== 'Tudo' || searchTerm) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-text-dim">Filtros:</span>
            {selectedCategory !== 'Tudo' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                style={{ backgroundColor: 'rgba(59,139,185,0.15)', color: '#FFB347', border: '1px solid rgba(59,139,185,0.3)' }}>
                {selectedCategory}
                <button onClick={() => setSelectedCategory('Tudo')} className="hover:text-white ml-1">×</button>
              </span>
            )}
            {searchTerm && (
              <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                style={{ backgroundColor: 'rgba(90,158,90,0.15)', color: '#1A2238', border: '1px solid rgba(90,158,90,0.3)' }}>
                Busca: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-white ml-1">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('Tudo'); }}
              className="text-xs text-text-dim hover:text-neon-cyan underline"
            >
              Limpar todos
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            {selectedCategory === 'Tudo' ? 'Todos os Produtos' : selectedCategory}
          </h2>
          <span className="text-sm text-text-dim">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[...Array(10)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    searchTerm={searchTerm}
                    onAddToCart={() => { onAddToCart(p); setToastMessage('Produto adicionado!'); setToastVisible(true); }}
                    onViewDetail={() => onViewDetail(p)}
                  />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59,139,185,0.05)' }}>
              <Package size={32} className="text-text-dim" />
            </div>
            <p className="text-text-dim text-lg">Nenhum produto encontrado</p>
            <p className="text-sm text-text-dim">Tente ajustar os filtros ou buscar por outro termo</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('Tudo'); }}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: 'rgba(59,139,185,0.1)', color: '#FFB347', border: '1px solid rgba(59,139,185,0.3)' }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </main>

      {/* Footer E-commerce Profissional */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="flex items-center justify-center font-semibold text-xl text-midnight mb-4">
            <svg className="text-amber mr-1" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span>fac<span className="text-amber">ii</span>l</span>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-8">Sua escolha inteligente em tecnologia</p>
          <div className="flex justify-center space-x-6 text-gray-500 mb-8">
            <a href="#" className="hover:text-amber transition"><small>Suporte</small></a>
            <a href="#" className="hover:text-amber transition"><small>Termos</small></a>
            <a href="#" className="hover:text-amber transition"><small>Envio</small></a>
          </div>
          <div className="text-[10px] text-gray-300">© 2026 Faciil. Brasil.</div>
        </div>
      </footer>

      {/* Botão Painel Admin */}
      <button
        onClick={onAdmin}
        className="fixed bottom-6 left-6 px-4 py-2 rounded-lg text-xs font-bold z-40 transition-all hover:scale-105"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#4A5568', border: '1px solid #FFFFFF' }}
      >
        Admin
      </button>

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-40 transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: '#1A2238',  }}
        >
          <ArrowUp size={20} className="text-black" />
        </button>
      )}
    </div>
  );
};

export default Storefront;
