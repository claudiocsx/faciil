import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, SlidersHorizontal, ChevronDown, ClipboardList } from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import Logo from './Logo';

const TECH_CATEGORIES = ['Tudo', 'Smartwatches', 'Fones Bluetooth', 'Carregadores', 'Cabos', 'Capas', 'Películas'];

const Storefront = ({ products, cart, onAddToCart, onUpdateQuantity, onRemoveItem, onViewDetail, onOrders, onAdmin, whatsappNumber, onSaveOrder }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [sortBy, setSortBy] = useState('featured');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

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
    <div className="min-h-screen grid-bg" style={{ backgroundColor: '#050505' }}>
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
      <div className="py-2 text-center text-xs font-semibold relative overflow-hidden" style={{ backgroundColor: 'rgba(57,255,20,0.08)', color: '#39FF14' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span>🛵 Entregas via Uber Flash em toda a cidade</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Retirada grátis no local disponível</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b sticky top-0 z-40 backdrop-blur-xl" style={{ backgroundColor: 'rgba(5,5,5,0.8)', borderColor: 'rgba(29,242,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="drop-shadow-[0_0_8px rgba(29,242,255,0.6)]">
                <Logo size={36} />
              </div>
              <span className="font-black text-xl text-text-primary">Faciil</span>
            </div>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-text-primary placeholder-text-dim transition-all outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(29,242,255,0.1)' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(29,242,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(29,242,255,0.1)'}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onAdmin && (
                <button
                  onClick={onAdmin}
                  className="hidden md:flex items-center gap-2 p-2.5 rounded-xl transition-all hover:bg-white/5 text-text-dim hover:text-neon-cyan"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-xs font-medium">Painel Admin</span>
                </button>
              )}
              {onOrders && (
                <button
                  onClick={onOrders}
                  className="hidden sm:flex items-center gap-2 p-2.5 rounded-xl transition-all hover:bg-white/5 text-text-dim hover:text-text-secondary"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <ClipboardList size={18} />
                  <span className="text-xs font-medium">Pedidos</span>
                </button>
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(29,242,255,0.1)' }}
              >
              <ShoppingCart size={20} style={{ color: '#1DF2FF' }} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 8px rgba(57,255,20,0.5)' }}>
                  {totalItems}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(29,242,255,0.15) 0%, rgba(57,255,20,0.1) 50%, rgba(255,184,0,0.05) 100%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(29,242,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(57,255,20,0.08) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 text-black" style={{ backgroundColor: '#1DF2FF', boxShadow: '0 0 10px rgba(29,242,255,0.4)' }}>
              Novidades da Semana
            </span>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-4 text-text-primary glow-text-cyan">
              Tecnologia que cabe no seu bolso
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              Os melhores acessórios tech com preços imperdíveis. Frete grátis para todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-8 py-3.5 text-black rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: '#1DF2FF', boxShadow: '0 0 12px rgba(29,242,255,0.5), 0 0 24px rgba(29,242,255,0.2)' }}>
                Ver Ofertas
              </button>
              <button className="px-8 py-3.5 rounded-xl font-bold text-sm glass-card text-text-primary hover:border-neon-cyan/40 transition-all">
                Lançamentos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(5,5,5,0.9)', borderColor: 'rgba(29,242,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all glass-card text-text-primary hover:border-neon-cyan/40"
              >
                <SlidersHorizontal size={16} style={{ color: '#1DF2FF' }} />
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
                      style={selectedCategory === cat ? { color: '#1DF2FF' } : {}}
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
                      ? { backgroundColor: '#1DF2FF', color: '#000', boxShadow: '0 0 10px rgba(29,242,255,0.4)' }
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
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            {selectedCategory === 'Tudo' ? 'Todos os Produtos' : selectedCategory}
          </h2>
          <span className="text-sm text-text-dim">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(29,242,255,0.05)' }}>
              <Search size={32} className="text-text-dim" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Nenhum produto encontrado</h3>
            <p className="text-text-dim">Tente ajustar seus filtros ou buscar por outro termo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: 'rgba(29,242,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-text-primary mb-4">FaciilTech</h4>
              <p className="text-sm text-text-dim">Os melhores acessórios tech com preços imperdíveis.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-4">Institucional</h4>
              <ul className="space-y-2 text-sm text-text-dim">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-4">Ajuda</h4>
              <ul className="space-y-2 text-sm text-text-dim">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Trocas e Devoluções</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Fale Conosco</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-4">Pagamento</h4>
              <p className="text-sm text-text-dim">Aceitamos PIX, cartão de crédito e boleto.</p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-text-dim" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            © 2026 FaciilTech. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;
