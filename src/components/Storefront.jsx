import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Package, Loader2, Tag, Percent, CreditCard, Shield, Truck, Mail, MapPin, User, LogOut, X, Watch, Headphones, Plug, Cable, Smartphone, Star, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import FeaturedProducts from './FeaturedProducts';
import CartSidebar from './CartSidebar';
import Toast from './Toast';
import Logo from './Logo';
import ProductSkeleton from './ProductSkeleton';
import CustomerAuthModal from './CustomerAuthModal';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const ICONS_MAP = {
  'Smartwatches': Watch,
  'Fones Bluetooth': Headphones,
  'Carregadores': Plug,
  'Cabos': Cable,
  'Capas': Smartphone,
  'Películas': Shield,
  'default': Package,
};

const COUPONS_DATA = [
  { id: 1, code: 'FACIIL10', discount: '10% OFF' },
  { id: 2, code: 'PRIMEIRA', discount: '15% OFF' },
  { id: 3, code: 'TECNOLOGIA', discount: '20% OFF' },
  { id: 4, code: 'NOVIDADE', discount: 'R$ 30 OFF' },
];

const BANNER_DATA = {
  title: 'Smartwatch Pro',
  subtitle: '30% OFF',
  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
};

const Storefront = ({ products, cart, onAddToCart, onUpdateQuantity, onRemoveItem, onViewDetail, onOrders, whatsappNumber, onSaveOrder }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['Tudo']);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { customer, customerLogout } = useCustomerAuth();
  const [visibleCount, setVisibleCount] = useState(12);
  const [categories, setCategories] = useState(['Tudo']);
  const searchRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const offerScrollRef = useRef(null);

  const [categoryIcons, setCategoryIcons] = useState({});

  const DEFAULT_CATEGORIES = ['Tudo', 'Smartwatches', 'Fones Bluetooth', 'Carregadores', 'Cabos', 'Capas', 'Películas'];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const cats = snap.docs.map(d => d.data());
        if (cats.length > 0) {
          const catNames = ['Tudo', ...cats.map(c => c.name)];
          const catIcons = {};
          cats.forEach(c => { catIcons[c.name] = c.icon || 'default'; });
          setCategories(catNames);
          setCategoryIcons(catIcons);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setVisibleCount(12);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategories, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const offerProducts = useMemo(() => {
    return products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 10);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const catMatch = selectedCategories.includes('Tudo') || selectedCategories.includes(p.category);
      const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const minMatch = priceRange.min === '' || p.price >= Number(priceRange.min);
      const maxMatch = priceRange.max === '' || p.price <= Number(priceRange.max);
      return catMatch && searchMatch && minMatch && maxMatch;
    });

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }

    return result;
  }, [products, searchTerm, selectedCategories, sortBy, priceRange]);

  const suggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return filteredProducts.slice(0, 6);
  }, [filteredProducts, searchTerm]);

  const toggleCategory = (cat) => {
    setVisibleCount(12);
    if (cat === 'Tudo') {
      setSelectedCategories(['Tudo']);
    } else {
      let current = selectedCategories.filter(c => c !== 'Tudo');
      if (current.includes(cat)) {
        current = current.filter(c => c !== cat);
      } else {
        current = [...current, cat];
      }
      setSelectedCategories(current.length === 0 ? ['Tudo'] : current);
    }
  };

  const clearFilters = () => {
    setSelectedCategories(['Tudo']);
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
  };

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Categorias */}
      <div>
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: '#1A2238' }}>Categorias</h3>
        <div className="space-y-1">
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded"
                style={{ accentColor: '#FFB347' }}
              />
              <span className="text-sm text-text-primary" style={{ color: '#475569' }}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div>
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: '#1A2238' }}>Preço</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
          />
          <span style={{ color: '#94A3B8' }}>—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
          />
        </div>
      </div>

      {/* Ordenar */}
      <div>
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: '#1A2238' }}>Ordenar</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
        >
          <option value="featured">Destaques</option>
          <option value="newest">Novidades</option>
          <option value="price-asc">Menor Preço</option>
          <option value="price-desc">Maior Preço</option>
          <option value="name">A-Z</option>
        </select>
      </div>

      {/* Limpar */}
      {(selectedCategories.length !== 1 || !selectedCategories.includes('Tudo') || priceRange.min !== '' || priceRange.max !== '' || searchTerm) && (
        <button
          onClick={() => { clearFilters(); setFilterDrawerOpen(false); }}
          className="w-full text-xs px-3 py-2 rounded-lg transition-colors font-medium"
          style={{ color: '#FFB347', backgroundColor: 'rgba(255,179,71,0.1)' }}
        >
          Limpar todos os filtros
        </button>
      )}
    </div>
  );

  const testimonials = [
    { name: "João Silva", text: "Produto chegou super rápido pelo Uber Flash! Qualidade excelente.", rating: 5 },
    { name: "Maria Oliveira", text: "Comprei um smartwatch e amei. Atendimento nota 10!", rating: 5 },
    { name: "Carlos Santos", text: "Melhor loja de acessórios do Crato. Preço justo e entrega rápida.", rating: 5 },
    { name: "Ana Ferreira", text: "Fone Bluetooth incrível! Superou minhas expectativas.", rating: 4 },
    { name: "Pedro Costa", text: "Comprei capa e película, tudo perfeito. Recomendo!", rating: 5 },
  ];

  return (
    <div className="min-h-screen grid-bg" style={{ backgroundColor: '#FDFDFD' }}>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      
      {authModalOpen && <CustomerAuthModal onClose={() => setAuthModalOpen(false)} />}

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onAddToCart={onAddToCart}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        whatsappNumber={whatsappNumber}
        onSaveOrder={onSaveOrder}
        customer={customer}
        products={products}
      />

      {/* Delivery Banner */}
      <div className="py-2 text-center text-xs font-semibold relative overflow-hidden" style={{ backgroundColor: 'rgba(90,158,90,0.08)', color: 'var(--color-neon-green)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-xs font-semibold" style={{ color: '#1A2238' }}>
          <Truck size={14} className="flex-shrink-0" style={{ color: '#FFB347' }} /> <span>Entregas via Uber Flash em Crato - CE</span>
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
              onClick={() => { navigate('/'); window.scrollTo({ top: 0 }); }}
              className="flex items-center gap-1 lg:gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <Logo size={20} />
              <span className="font-black text-base lg:text-xl tracking-tight" style={{ color: '#1A2238' }}>fac<span style={{ color: '#FFB347', letterSpacing: '-1px' }}>ii</span>l</span>
            </button>

            {/* Busca - hidden em mobile */}
            <div className="hidden md:flex flex-1 max-w-xl" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  onFocus={(e) => { e.target.style.borderColor = '#FFB347'; setSearchFocused(true); }}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.04)'}
                />
                {searchFocused && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
                    {suggestions.map(p => {
                      const img = p.image || p.images?.[0];
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => { onViewDetail(p); setSearchFocused(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                            {img && !img.startsWith('blob:') ? (
                              <img src={img} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={14} style={{ color: '#CBD5E1' }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#1A2238' }}>{p.name}</p>
                            <p className="text-xs font-bold" style={{ color: '#FFB347' }}>R$ {p.price?.toFixed(2)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Busca no mobile */}
              <button 
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-xl transition-all hover:bg-black/5"
                style={{ border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <Search size={18} style={{ color: '#1A2238' }} />
              </button>
              
              {customer ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1 lg:gap-2 p-2 lg:p-2.5 rounded-xl transition-all hover:bg-black/5"
                    style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    <User size={16} style={{ color: '#FFB347' }} />
                    <span className="text-xs font-medium hidden sm:inline" style={{ color: '#1A2238' }}>{customer.name}</span>
                    <ChevronDown size={12} style={{ color: '#94A3B8' }} />
                  </button>
                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-40 border" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                        <button
                          onClick={() => { setUserDropdownOpen(false); navigate('/meus-pedidos'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors hover:bg-black/5"
                          style={{ color: '#1A2238' }}
                        >
                          <ClipboardList size={16} style={{ color: '#94A3B8' }} /> Meus Pedidos
                        </button>
                        <button
                          onClick={() => { setUserDropdownOpen(false); customerLogout(); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors hover:bg-black/5"
                          style={{ color: '#EF4444' }}
                        >
                          <LogOut size={16} /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1 lg:gap-2 p-2 lg:p-2.5 rounded-xl transition-all hover:bg-black/5"
                  style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <User size={16} style={{ color: '#94A3B8' }} />
                  <span className="text-xs font-medium hidden sm:inline" style={{ color: '#1A2238' }}>Entrar</span>
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

      {/* Produtos em Destaque - ML Style */}
      <FeaturedProducts
        products={products}
        onAddToCart={(p) => { onAddToCart(p); setToastMessage('Produto adicionado!'); setToastVisible(true); }}
        onViewDetail={(p) => onViewDetail(p)}
      />

      {/* Banner Promocional - ML Style */}
      <section className="py-2 sm:py-3" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: '#1A2238', aspectRatio: '4/1' }}>
            <img src={BANNER_DATA.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,34,56,0.92) 0%, rgba(26,34,56,0.5) 30%, rgba(26,34,56,0.08) 60%, transparent 80%)' }} />
            <div className="relative z-10 flex items-center h-full px-5 md:px-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] block mb-1" style={{ color: '#FFB347' }}>
                  <Tag size={11} className="inline mr-1.5" style={{ verticalAlign: '-1px' }} />Oferta
                </span>
                <h2 className="text-sm sm:text-lg md:text-2xl font-black text-white leading-tight">{BANNER_DATA.title}</h2>
                <p className="text-xs sm:text-sm md:text-lg font-bold mt-0.5 mb-1.5 md:mb-2" style={{ color: '#FFB347' }}>{BANNER_DATA.subtitle}</p>
                <button
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3.5 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                >
                  Ver Oferta
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ofertas - ML Style */}
      {offerProducts.length > 0 && (
        <section className="py-6 sm:py-8" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#FFB347' }}>
                  <Tag size={14} style={{ color: '#1A2238' }} />
                </div>
                <h2 className="text-sm sm:text-lg font-black" style={{ color: '#1A2238' }}>Ofertas</h2>
              </div>
            </div>
            <div ref={offerScrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-4 px-4">
              {offerProducts.map(p => {
                const img = p.image || p.images?.[0];
                const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                return (
                  <div
                    key={p.id}
                    onClick={() => onViewDetail(p)}
                    className="flex-shrink-0 snap-start w-[65vw] sm:w-[280px] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
                      {img && !img.startsWith('blob:') ? (
                        <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
                          <Tag size={32} style={{ color: '#CBD5E1' }} />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2.5 py-1 rounded-full text-[10px] font-black z-10" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                        -{discount}%
                      </span>
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
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                        className="w-full mt-1.5 py-2 rounded-lg font-bold text-xs transition-all hover:opacity-90"
                        style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Cupons - ML Style */}
      <section className="py-4 sm:py-5" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#FFB347' }}>
              <Percent size={14} style={{ color: '#1A2238' }} />
            </div>
            <h2 className="text-sm sm:text-lg font-black" style={{ color: '#1A2238' }}>Cupons</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
            {COUPONS_DATA.map(coupon => (
              <div
                key={coupon.id}
                className="flex-shrink-0 snap-start w-[220px] sm:w-[260px] rounded-xl p-4 flex items-center justify-between gap-3"
                style={{ backgroundColor: '#1A2238' }}
              >
                <div>
                  <p className="text-base sm:text-lg font-black text-white tracking-tight">{coupon.code}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#FFB347' }}>{coupon.discount}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(coupon.code); setToastVisible(true); setToastMessage(`Cupom ${coupon.code} copiado!`); setTimeout(() => setToastVisible(false), 3000); }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Carousel - mobile only */}
      <section className="lg:hidden" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-4 px-4">
            {categories.map((cat) => {
              const IconComponent = ICONS_MAP[cat] || ICONS_MAP[categoryIcons[cat]] || ICONS_MAP.default;
              const isSelected = selectedCategories.includes(cat) && (cat === 'Tudo' ? selectedCategories.length === 1 || selectedCategories.includes('Tudo') : true);
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategories([cat]); setVisibleCount(12); window.scrollTo({ top: 450, behavior: 'smooth' }); }}
                  className={`flex-shrink-0 snap-start flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    isSelected ? '' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? '#FFB347' : 'rgba(0,0,0,0.03)', 
                    color: isSelected ? '#1A2238' : '#64748B',
                    border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <IconComponent size={14} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238', appearance: 'none' }}
              >
                <option value="featured">Ordenar: Destaques</option>
                <option value="newest">Ordenar: Novidades</option>
                <option value="price-asc">Ordenar: Menor Preço</option>
                <option value="price-desc">Ordenar: Maior Preço</option>
                <option value="name">Ordenar: A-Z</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            </div>

            {/* Filter button - mobile only */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-black/5"
              style={{ border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>

            {(selectedCategories.length !== 1 || !selectedCategories.includes('Tudo') || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-xs px-3 py-2 rounded-lg transition-colors"
                style={{ color: '#FFB347', backgroundColor: 'rgba(255,179,71,0.1)' }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid with Sidebar */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8" style={{ alignItems: 'start' }}>
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block sticky" style={{ top: '5rem', alignSelf: 'start' }}>
            {renderFilterContent()}
          </aside>

          {/* Product Area */}
          <div>
            {/* Filtros Ativos */}
            {(selectedCategories.length !== 1 || !selectedCategories.includes('Tudo') || searchTerm || priceRange.min !== '' || priceRange.max !== '') && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm" style={{ color: '#64748B' }}>Filtros:</span>
                {!selectedCategories.includes('Tudo') && selectedCategories.map(cat => (
                  <span key={cat} className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ backgroundColor: 'rgba(255,179,71,0.15)', color: '#1A2238', border: '1px solid rgba(255,179,71,0.3)' }}>
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="hover:opacity-60 ml-1">×</button>
                  </span>
                ))}
                {searchTerm && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ backgroundColor: 'rgba(90,158,90,0.15)', color: '#1A2238', border: '1px solid rgba(90,158,90,0.3)' }}>
                    Busca: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:opacity-60 ml-1">×</button>
                  </span>
                )}
                {(priceRange.min !== '' || priceRange.max !== '') && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ backgroundColor: 'rgba(59,139,185,0.15)', color: '#1A2238', border: '1px solid rgba(59,139,185,0.3)' }}>
                    Preço: {priceRange.min ? `R$${priceRange.min}` : '0'} - {priceRange.max ? `R$${priceRange.max}` : '∞'}
                    <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:opacity-60 ml-1">×</button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs underline"
                  style={{ color: '#64748B' }}
                >
                  Limpar todos
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: '#1A2238' }}>
                {selectedCategories.includes('Tudo') ? 'Todos os Produtos' : selectedCategories.join(', ')}
              </h2>
              <span className="text-sm" style={{ color: '#64748B' }}>
                {visibleCount >= filteredProducts.length 
                  ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto' : 'produtos'}` 
                  : `Mostrando ${visibleCount} de ${filteredProducts.length} produtos`}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {filteredProducts.slice(0, visibleCount).map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      searchTerm={searchTerm}
                      onAddToCart={() => { onAddToCart(p); setToastMessage('Produto adicionado!'); setToastVisible(true); }}
                      onViewDetail={() => onViewDetail(p)}
                    />
                  ))}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisibleCount(v => v + 12)}
                      className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 15px rgba(255,179,71,0.3)' }}
                    >
                      Ver mais ({filteredProducts.length - visibleCount} produtos)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,179,71,0.05)' }}>
                  <Package size={32} style={{ color: '#CBD5E1' }} />
                </div>
                <p className="text-lg" style={{ color: '#64748B' }}>Nenhum produto encontrado</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Tente ajustar os filtros ou buscar por outro termo</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ backgroundColor: 'rgba(255,179,71,0.1)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.3)' }}
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Depoimentos */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#1A2238' }}>
              O que nossos clientes dizem
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
              A confiança de quem já comprou
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-5 md:p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s < t.rating ? '#FFB347' : 'none'}
                      style={{ color: s < t.rating ? '#FFB347' : '#CBD5E1' }}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#475569' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-sm font-bold" style={{ color: '#1A2238' }}>
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Mobile Filter Drawer */}
      {filterDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden" onClick={() => setFilterDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold" style={{ color: '#1A2238' }}>Filtros</h2>
                <button onClick={() => setFilterDrawerOpen(false)} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                  <X size={20} style={{ color: '#94A3B8' }} />
                </button>
              </div>
              {renderFilterContent()}
            </div>
          </div>
        </>
      )}

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden" onClick={() => { setMobileSearchOpen(false); setSearchFocused(false); }} />
          <div className="fixed top-0 left-0 right-0 z-50 p-4 md:hidden bg-white shadow-lg" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Buscar produtos..."
                autoFocus
                className="w-full pl-10 pr-12 py-3 rounded-xl text-base outline-none"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
              />
              <button
                onClick={() => { setMobileSearchOpen(false); setSearchFocused(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg"
                style={{ color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', maxHeight: '50vh', overflowY: 'auto' }}>
                  {suggestions.map(p => {
                    const img = p.image || p.images?.[0];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => { onViewDetail(p); setMobileSearchOpen(false); setSearchFocused(false); }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                          {img && !img.startsWith('blob:') ? (
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} style={{ color: '#CBD5E1' }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#1A2238' }}>{p.name}</p>
                          <p className="text-xs font-bold" style={{ color: '#FFB347' }}>R$ {p.price?.toFixed(2)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Storefront;
