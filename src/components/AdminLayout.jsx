import React, { useState, useEffect } from 'react';
import NotificationPanel from './NotificationPanel';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Users, Settings, Bell, Search, Menu, X, Home, TrendingUp, FileText, LogOut, Store, Ticket, PlusCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const unread = snap.docs.filter(d => !d.data().read).length;
      setNotifCount(unread);
    });
    return unsub;
  }, []);

  const currentModule = location.pathname.split('/admin/')[1] || 'dashboard';

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/admin' },
    { id: 'pos', icon: PlusCircle, label: 'PDV (Venda Manual)', path: '/admin/pos' },
    { id: 'products', icon: Package, label: 'Produtos', path: '/admin/products' },
    { id: 'coupons', icon: Ticket, label: 'Cupons', path: '/admin/coupons' },
    { id: 'clients', icon: Users, label: 'Clientes', path: '/admin/clients' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos', path: '/admin/orders' },
  ];

  const isActive = (id) => currentModule === id || (id === 'dashboard' && currentModule === '');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-l-0" style={{ borderColor: 'var(--color-border-glow)', backgroundColor: 'var(--color-bg-card)' }}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-6 border-b" style={{ borderColor: 'var(--color-border-glow)' }}>
            <div className="flex items-center gap-3">
              <div className="drop-shadow-[0_0_6px rgba(29,242,255,0.6)]">
                <Logo size={32} />
              </div>
              <span className="font-black text-xl text-text-primary">Faciil</span>
            </div>
          </div>

          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border-glow)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: '#1DF2FF' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{user?.name}</p>
                <p className="text-xs uppercase font-semibold" style={{ color: '#39FF14' }}>{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="px-3 text-xs font-black text-text-dim uppercase tracking-widest mb-3">Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all"
                  style={active ? { backgroundColor: 'rgba(29,242,255,0.1)', color: '#1DF2FF', border: '1px solid rgba(29,242,255,0.2)' } : { color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid transparent' }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--glass-bg)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: 'var(--color-border-glow)' }}>
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-dim hover:text-text-secondary rounded-xl transition-all hover:bg-white/5">
              <Store size={18} />
              Ver Loja
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64" style={{ backgroundColor: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border-glow)' }}>
            <div className="flex items-center justify-between h-16 px-6 border-b" style={{ borderColor: 'var(--color-border-glow)' }}>
              <div className="flex items-center gap-3">
                <div className="drop-shadow-[0_0_6px rgba(29,242,255,0.6)]">
                  <Logo size={32} />
                </div>
                <span className="font-black text-xl text-text-primary">Faciil</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-text-dim hover:text-text-secondary">
                <X size={20} />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all"
                    style={active ? { backgroundColor: 'rgba(29,242,255,0.1)', color: '#1DF2FF' } : { color: 'var(--color-text-secondary)' }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="border-b h-16 px-4 lg:px-6" style={{ borderColor: 'var(--color-border-glow)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="flex items-center justify-between h-full">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-text-dim hover:text-text-secondary">
              <Menu size={20} />
            </button>

            <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-text-primary placeholder-text-dim outline-none transition-all"
                  style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(29,242,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-all text-black"
                style={{ backgroundColor: '#1DF2FF', boxShadow: '0 0 8px rgba(29,242,255,0.3)' }}
              >
                <Store size={16} />
                Ver Loja
              </button>
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-text-dim hover:text-text-secondary transition-colors">
                  <Bell size={20} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFB800' }}>
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
                <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 text-text-dim hover:text-text-secondary transition-colors"
                title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
