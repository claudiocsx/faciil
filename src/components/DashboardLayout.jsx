import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Home,
  TrendingUp,
  FileText,
  LogOut,
  Store,
  Sun,
  Moon,
} from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';

const DashboardLayout = ({ children, currentModule, onModuleChange, onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Produtos' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
    { id: 'clientes', icon: Users, label: 'Clientes' },
    { id: 'relatorios', icon: FileText, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFDFD' }}>
      {/* Sidebar Desktop */}
      <div
        className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-l-0"
        style={{ borderColor: 'rgba(0,0,0,0.04)', backgroundColor: '#FFFFFF' }}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-center h-16 px-6 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3">
              <div className="drop-shadow-[0_0_6px rgba(59,139,185,0.6)]">
                <Logo size={32} />
              </div>
              <span className="font-black text-xl text-text-primary">Faciil</span>
            </div>
          </div>

          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold"
                style={{ backgroundColor: '#FFB347' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{user?.name}</p>
                <p className="text-xs uppercase font-semibold" style={{ color: '#1A2238' }}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="px-3 text-xs font-black text-text-dim uppercase tracking-widest mb-3">
              Menu
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all"
                  style={
                    currentModule === item.id
                      ? {
                          backgroundColor: 'rgba(59,139,185,0.1)',
                          color: '#FFB347',
                          border: '1px solid rgba(59,139,185,0.2)',
                        }
                      : {
                          color: '#4A5568',
                          backgroundColor: 'transparent',
                          border: '1px solid transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (currentModule !== item.id)
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (currentModule !== item.id)
                      e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-dim hover:text-text-secondary rounded-xl transition-all hover:bg-white/5">
              <Settings size={18} />
              Configurações
            </button>
            <button
              onClick={onLogout}
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
          <div
            className="fixed inset-y-0 left-0 w-64"
            style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div
              className="flex items-center justify-between h-16 px-6 border-b"
              style={{ borderColor: 'rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3">
                <div className="drop-shadow-[0_0_6px rgba(59,139,185,0.6)]">
                  <Logo size={32} />
                </div>
                <span className="font-black text-xl text-text-primary">Faciil</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-text-dim hover:text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onModuleChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all"
                    style={
                      currentModule === item.id
                        ? { backgroundColor: 'rgba(59,139,185,0.1)', color: '#FFB347' }
                        : { color: '#4A5568' }
                    }
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
        <header className="glass-header sticky top-0 z-30 px-4 lg:px-6 h-16">
          <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-neon-cyan transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #E2E8F0' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FFB347';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,139,185,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-slate-600 hover:text-neon-cyan transition-colors">
                <Bell size={20} />
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 text-black text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFB800' }}
                >
                  3
                </span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 hover:text-neon-cyan transition-colors"
                title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
