import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, SlidersHorizontal, ChevronDown, ClipboardList, Package, Loader2, ArrowUp } from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import Toast from './Toast';
import Logo from './Logo';
import ProductSkeleton from './ProductSkeleton';

const TECH_CATEGORIES = ['Tudo', 'Smartwatches', 'Fones Bluetooth', 'Carregadores', 'Cabos', 'Capas', 'Películas'];

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="drop-shadow-[0_0_6px rgba(255,179,71,0.6)]">
                <Logo size={36} />
              </div>
              <span className="font-black text-xl" style={{ color: '#1A2238' }}>Faciil</span>
            </div>

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
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFB347' }}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner - Moderno */}
      <section className="py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center" style={{ backgroundColor: '#1A2238' }}>
            <div className="md:w-1/2 z-10 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4" style={{ backgroundColor: 'rgba(255,179,71,0.2)', color: '#FFB347' }}>Acesso Antecipado</span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Escolha <span style={{ color: '#FFB347' }}>faciil</span>, viva moderno.
              </h1>
              <p className="text-gray-300 text-sm md:text-lg mb-8 max-w-sm">
                Curadoria exclusiva de acessórios que aceleram a sua rotina.
              </p>
              <button 
                onClick={() => { setShowOffers(false); setSelectedCategory('Tudo'); window.document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105" 
                style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
              >
                Explorar Tudo
              </button>
            </div>
            <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -z-10 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: '#FFB347' }}></div>
                <img 
                  src="https://images.unsplash.com/photo-1546868831-d1be1c463959?auto=format&fit=crop&w=800&q=80" 
                  alt="Produto Destaque" 
                  className="w-full max-w-md mx-auto drop-shadow-2xl transform rotate-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
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
                <ChevronDown size={14} className="text-gray-400" />
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
              <span className="text-sm text-gray-500">Filtros:</span>
              {selectedCategory !== 'Tudo' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(255,179,71,0.1)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.2)' }}>
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Tudo')} className="hover:text-black ml-1 font-bold">×</button>
                </span>
              )}
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('Tudo'); }}
                className="text-xs text-gray-500 hover:text-amber underline"
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
            <div className="drop-shadow-[0_0_6px rgba(255,179,71,0.6)]">
              <Logo size={32} />
            </div>
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
