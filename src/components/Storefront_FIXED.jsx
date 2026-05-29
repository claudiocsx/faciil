import React, { useState, useMemo } from 'react';
import { ShoppingCart, SlidersHorizontal, ChevronDown, ClipboardList, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import Toast from './Toast';
import { TECH_CATEGORIES } from '../data/categories';

const Storefront = ({
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onViewDetail,
  onOrders,
  onAdmin,
  whatsappNumber,
  onSaveOrder,
}) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [sortBy, setSortBy] = useState('featured');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ... resto do código (lógica)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFDFD' }}>
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        whatsappNumber={whatsappNumber}
        onSaveOrder={onSaveOrder}
      />

      {/* Header */}
      <header
        className="border-b sticky top-0 z-40"
        style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo Faciil com Raio */}
            <div
              className="flex items-center font-semibold text-2xl tracking-tight"
              style={{ color: '#1A2238' }}
            >
              <svg
                className="text-amber mr-1"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>
                fac<span style={{ color: '#FFB347' }}>ii</span>l
              </span>
            </div>

            {/* Busca & Carrinho */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: '#4A5568' }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    color: '#1A2238',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#FFB347')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.04)')}
                />
              </div>
              <button
                className="relative p-2.5 rounded-xl transition-all hover:bg-black/5"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart size={20} style={{ color: '#1A2238' }} />
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FFB347' }}
                  >
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Resto do conteúdo (Hero, Filters, Products, Footer) */}
    </div>
  );
};

export default Storefront;
