import React, { useState, useEffect } from 'react';
import NotificationPanel from './NotificationPanel';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Users, Settings, Bell, Search, Menu, X, Home, TrendingUp, FileText, LogOut, Store, Ticket, PlusCircle, Sun, Moon, Image, Tag } from 'lucide-react';
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
    { id: 'dashboard', icon: Home, label: 'Início', path: '/admin' },
    { id: 'pos', icon: PlusCircle, label: 'PDV', path: '/admin/pos' },
    { id: 'products', icon: Package, label: 'Produtos', path: '/admin/products' },
    { id: 'categories', icon: Tag, label: 'Categorias', path: '/admin/categories' },
    { id: 'banners', icon: Image, label: 'Banners', path: '/admin/banners' },
    { id: 'coupons', icon: Ticket, label: 'Cupons', path: '/admin/coupons' },
    { id: 'clients', icon: Users, label: 'Clientes', path: '/admin/clients' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos', path: '/admin/orders' },
    { id: 'reports', icon: FileText, label: 'Relatórios', path: '/admin/reports' },
  ];

  const isActive = (id) => currentModule === id || (id === 'dashboard' && currentModule === '');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFDFD' }}>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 px-6" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3">
              <Logo size={36} />
              <span className="font-black text-2xl" style={{ color: '#1A2238' }}>faciil</span>
            </div>
          </div>

          <div className="p-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <button onClick={() => navigate('/admin/perfil')} className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80 text-left" style={{ backgroundColor: '#F8FAFC' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#1A2238' }}>{user?.name}</p>
                <p className="text-xs font-bold uppercase" style={{ color: '#94A3B8' }}>{user?.role}</p>
              </div>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer"
                  style={active 
                    ? { backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' } 
                    : { color: '#4A5568', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto space-y-2">
            <button 
              onClick={() => navigate('/')} 
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all hover:brightness-110"
              style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
            >
              <Store size={18} />
              Ver Loja
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all hover:opacity-80"
              style={{ color: '#EF4444', backgroundColor: '#FEF2F2' }}
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
          <div className="fixed inset-y-0 left-0 w-64" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-6 border-b shrink-0" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3">
                    <Logo size={32} />
                    <span className="font-black text-xl" style={{ color: '#1A2238' }}>faciil</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-text-dim hover:text-text-secondary">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <button onClick={() => { navigate('/admin/perfil'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left" style={{ backgroundColor: '#F8FAFC' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#1A2238' }}>{user?.name}</p>
                      <p className="text-xs font-bold uppercase" style={{ color: '#94A3B8' }}>{user?.role}</p>
                    </div>
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
                        style={active ? { backgroundColor: 'rgba(59,139,185,0.1)', color: '#FFB347' } : { color: '#4A5568' }}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="p-3 space-y-2 shrink-0">
                <button 
                  onClick={() => { navigate('/'); setSidebarOpen(false); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all hover:brightness-110"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
                >
                  <Store size={18} />
                  Ver Loja
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all"
                  style={{ color: '#EF4444', backgroundColor: '#FEF2F2' }}
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 h-16 px-4 lg:px-6 bg-white/80 backdrop-blur-md" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between h-full">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2" style={{ color: '#1A2238' }}>
              <Menu size={24} />
            </button>
            
            <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                <input 
                  type="text" 
                  placeholder="Buscar produtos, pedidos, clientes..." 
                   className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB347'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.04)'}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: '#F8FAFC', color: '#1A2238', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <Store size={16} />
                Ver Loja
              </button>
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)} 
                  className="relative p-2.5 rounded-xl transition-all hover:bg-black/5"
                  style={{ backgroundColor: '#F8FAFC', color: '#1A2238', border: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <Bell size={20} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
                <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
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
