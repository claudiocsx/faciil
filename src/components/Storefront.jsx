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
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo Faciil com Raio */}
            <div className="flex items-center font-semibold text-2xl tracking-tight" style={{ color: '#1A2238' }}>
              <svg className="text-amber mr-1" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>fac<span style={{ color: '#FFB347' }}>ii</span>l</span>
            </div>
              <span className="font-black text-xl text-text-primary">Faciil</span>
            </div>
            
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-midnight placeholder-text-dim transition-all outline-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB347'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.04)'}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onAdmin && (
                <button
                  onClick={onAdmin}
                  className="hidden md:flex items-center gap-2 p-2.5 rounded-xl transition-all hover:bg-black/5"
                  style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <span className="text-xs font-medium" style={{ color: '#1A2238' }}>Painel Admin</span>
                </button>
              )}
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
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(59,139,185,0.1)' }}
              >
                <ShoppingCart size={20} style={{ color: '#FFB347' }} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-neon-lime)',  }}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner - Moderno */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,139,185,0.15) 0%, rgba(90,158,90,0.1) 50%, rgba(255,184,0,0.05) 100%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,139,185,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(90,158,90,0.08) 0%, transparent 50%)' }} />
        
        {/* Ícones flutuantes */}
        <div className="absolute top-20 left-10 opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59,139,185,0.2)' }}>
            <span className="text-2xl">⌚</span>
          </div>
        </div>
        <div className="absolute top-32 right-20 opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(90,158,90,0.2)' }}>
            <span className="text-xl">📱</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-15 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(255,184,0,0.2)' }}>
            <span className="text-lg">🔌</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 text-black glow-text-cyan" style={{ backgroundColor: 'var(--color-neon-cyan)',  }}>
              Novidades da Semana
            </span>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-4 text-text-primary glow-text-cyan">
              Tecnologia que cabe no seu bolso
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              Os melhores acessórios tech com preços imperdíveis. Frete grátis para todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => { setShowOffers(!showOffers); window.document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }} 
                className="px-8 py-3.5 text-black rounded-xl font-bold text-sm transition-all hover:scale-105" 
                style={{ backgroundColor: 'var(--color-neon-cyan)',  }}
              >
                Ver Ofertas
              </button>
              <button 
                onClick={() => { setShowOffers(false); setSelectedCategory('Tudo'); window.document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }} 
                className="px-8 py-3.5 rounded-xl font-bold text-sm glass-card text-text-primary hover:border-neon-cyan/40 transition-all hover:scale-105"
              >
                Lançamentos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(5,5,5,0.9)', borderColor: 'rgba(59,139,185,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all glass-card text-text-primary hover:border-neon-cyan/40"
              >
                <SlidersHorizontal size={16} style={{ color: 'var(--color-neon-cyan)' }} />
                {selectedCategory}
                <ChevronDown size={14} className="text-text-dim" />
              </button>
             
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-bg-elevated border border-border-glow rounded-xl shadow-2xl py-2 z-40">
                  {TECH_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                        selectedCategory === cat ? 'font-bold' : 'text-text-secondary'
                      }`}
                      style={selectedCategory === cat ? { color: '#FFB347' } : {}}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 overflow-x-auto flex-1">
              {TECH_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: '#FFB347', color: '#000',  }
                      : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#999', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto px-4 py-2.5 rounded-xl text-sm font-medium text-text-primary outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="featured" className="bg-bg-elevated">Destaques</option>
              <option value="newest" className="bg-bg-elevated">Novidades</option>
              <option value="price-asc" className="bg-bg-elevated">Menor Preço</option>
              <option value="price-desc" className="bg-bg-elevated">Maior Preço</option>
              <option value="name" className="bg-bg-elevated">A-Z</option>
            </select>
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      <footer className="py-12 border-t text-text-dim" style={{ borderColor: 'rgba(59,139,185,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="drop-shadow-[0_0_6px rgba(59,139,185,0.6)]">
                  <Logo size={32} />
                </div>
                <span className="font-black text-xl text-text-primary">Faciil</span>
              </div>
              <p className="text-sm">A melhor loja de acessórios tech com preços imbatíveis.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Início</a></li>
                <li><a href="#products-section" className="hover:text-neon-cyan transition-colors">Produtos</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Ofertas</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Trocas e Devoluções</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 contato@faciil.com</li>
                <li>📱 (11) 99999-9999</li>
                <li>📍 São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-xs" style={{ borderColor: 'rgba(59,139,185,0.1)' }}>
            <p>© 2026 Faciil Tech. Todos os direitos reservados.</p>
          </div>
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
