import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Package, Loader2, ArrowUp, Tag, Percent, CreditCard, Shield, Truck, Mail, MapPin } from 'lucide-react';
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

const Storefront = ({ products, cart, onAddToCart, onUpdateQuantity, onRemoveItem, onViewDetail, onOrders, whatsappNumber, onSaveOrder }) => {
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

  useEffect(() => {
    const total = getCarouselOffers().length + getCarouselCoupons().length;
    if (total === 0) return;
    const interval = setInterval(() => {
      setCurrentCarousel((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerOffers.length, bannerCoupons.length]);

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
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-xs font-semibold" style={{ color: '#1A2238' }}>
          <span>🛵 Entregas via Uber Flash em Crato - CE</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Retirada grátis no centro do Crato</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-3 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16 gap-2 lg:gap-4">
            {/* Logo Faciil Original */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 lg:gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <Logo size={20} />
              <span className="font-black text-base lg:text-xl tracking-tight" style={{ color: '#1A2238' }}>fac<span style={{ color: '#FFB347', letterSpacing: '-1px' }}>ii</span>l</span>
            </button>

            {/* Busca - hidden em mobile */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB347'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.04)'}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Busca no mobile */}
              <button 
                onClick={() => setSearchTerm(prompt('Buscar produto:') || '')}
                className="md:hidden p-2 rounded-xl transition-all hover:bg-black/5"
                style={{ border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <Search size={18} style={{ color: '#1A2238' }} />
              </button>
              
              {onOrders && (
                <button
                  onClick={onOrders}
                  className="hidden lg:flex items-center gap-1 lg:gap-2 p-2 lg:p-2.5 rounded-xl transition-all hover:bg-black/5"
                  style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <ClipboardList size={16} style={{ color: '#1A2238' }} />
                  <span className="text-xs font-medium" style={{ color: '#1A2238' }}>Pedidos</span>
                </button>
              )}
              <button
                onClick={() => setCartOpen(true)}
                data-cart-icon
                className="relative p-2 lg:p-2.5 rounded-xl transition-all hover:bg-black/5"
                style={{ border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <ShoppingCart size={18} style={{ color: '#1A2238' }} />
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 text-[10px] lg:text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Carrossel Principal */}
      <section className="px-0 sm:px-4 pt-2">
        <div className="max-w-7xl mx-auto">
          <div className="relative group sm:rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-hidden" style={{ backgroundColor: '#1A2238' }}>
              <div className="relative w-full" style={{ aspectRatio: '21 / 9' }}>
                <div className="absolute inset-0 flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentCarousel * 100}%)` }}>
                {getCarouselOffers().map((offer) => {
                  const hasText = offer.title || offer.subtitle;
                  return (
                  <div key={`offer-${offer.id}`} className="w-full flex-shrink-0 h-full relative overflow-hidden">
                    {offer.image && (
                      <img src={offer.image} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
                    )}
                    {hasText && <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 100%)' }} />}
                    {hasText && (
                    <div className="relative z-10 flex items-center h-full px-6 md:px-16">
                      <div className="max-w-lg">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 md:mb-4" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                          <Tag size={11} /> Oferta
                        </span>
                        {offer.title && <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">{offer.title}</h2>}
                        {offer.subtitle && <p className="text-base sm:text-xl md:text-3xl font-bold mt-0.5 md:mt-2 mb-2 md:mb-4" style={{ color: '#FFB347' }}>{offer.subtitle}</p>}
                        <button
                          onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                          className="px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                        >
                          Ver Oferta
                        </button>
                      </div>
                    </div>
                    )}
                  </div>
                  );
                })}
                {getCarouselCoupons().map((coupon) => (
                  <div key={`coupon-${coupon.id}`} className="w-full flex-shrink-0 h-full relative overflow-hidden">
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A2238 0%, #2A3A5C 50%, #1A2238 100%)' }} />
                    <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,179,71,0.3) 0%, transparent 70%)' }} />
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 md:mb-4" style={{ backgroundColor: coupon.color || '#FFB347', color: '#1A2238' }}>
                        <Percent size={11} /> Cupom
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">{coupon.code}</h2>
                      <p className="text-lg sm:text-xl md:text-3xl font-bold mt-0.5 md:mt-2 mb-2 md:mb-4" style={{ color: '#FFB347' }}>{coupon.discount}</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(coupon.code); setToastVisible(true); setToastMessage(`Cupom ${coupon.code} copiado!`); setTimeout(() => setToastVisible(false), 3000); }}
                        className="px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                      >
                        Copiar Cupom
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>

            <button onClick={prevCarousel} className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110">
              <ChevronLeft size={16} style={{ color: '#1A2238' }} />
            </button>
            <button onClick={nextCarousel} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110">
              <ChevronRight size={16} style={{ color: '#1A2238' }} />
            </button>

            <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {[...Array(getCarouselOffers().length + getCarouselCoupons().length)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCarousel(i)}
                  className={`rounded-full transition-all duration-300 ${i === currentCarousel ? 'w-5 h-1.5' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'}`}
                  style={{ backgroundColor: i === currentCarousel ? '#FFB347' : undefined }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
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

      {/* Footer */}
      <footer style={{ backgroundColor: '#1A2238', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size={32} />
                <span className="font-black text-xl" style={{ color: '#FFFFFF' }}>faciil</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>Acessórios tech com entrega rápida via Uber Flash. Sua escolha inteligente em tecnologia.</p>
              <div className="flex gap-3 mt-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <MapPin size={16} style={{ color: '#FFB347' }} />
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Mail size={16} style={{ color: '#FFB347' }} />
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <CreditCard size={16} style={{ color: '#FFB347' }} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Links</h4>
              <ul className="space-y-3">
                {['Produtos', 'Ofertas', 'Pedidos', 'Sobre'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm transition-colors hover:text-[#FFB347]" style={{ color: '#94A3B8' }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Segurança</h4>
              <ul className="space-y-3">
                {[
                  { icon: Shield, text: '1 ano de garantia' },
                  { icon: Truck, text: 'Entrega via Uber Flash' },
                  { icon: CreditCard, text: 'Pagamento na entrega' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                    <Icon size={14} style={{ color: '#FFB347' }} /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: '#64748B' }}>© 2026 Faciil. Todos os direitos reservados.</p>
            <div className="flex gap-6 text-xs" style={{ color: '#64748B' }}>
              <a href="#" className="hover:text-[#FFB347] transition-colors">Termos</a>
              <a href="#" className="hover:text-[#FFB347] transition-colors">Privacidade</a>
              <a href="#" className="hover:text-[#FFB347] transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center z-40 transition-all duration-300 hover:scale-110 shadow-lg"
          style={{ backgroundColor: '#FFB347', boxShadow: '0 4px 12px rgba(255,179,71,0.4)' }}
        >
          <ArrowUp size={22} style={{ color: '#1A2238' }} />
        </button>
      )}
    </div>
  );
};

export default Storefront;
