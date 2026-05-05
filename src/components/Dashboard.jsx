import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { TrendingUp, Package, ShoppingCart, Users, ArrowUpRight, AlertTriangle, Clock } from 'lucide-react';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ revenueToday: 0, revenueMonth: 0, totalOrders: 0, lowStock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      const today = new Date().toDateString();
      const currentMonth = new Date().getMonth();
      
      let revenueToday = 0;
      let revenueMonth = 0;
      let totalOrders = 0;

      data.forEach(o => {
        if (o.status !== 'cancelled') {
          totalOrders++;
          const orderDate = new Date(o.date);
          const amount = o.total || 0;
          if (orderDate.toDateString() === today) revenueToday += amount;
          if (orderDate.getMonth() === currentMonth) revenueMonth += amount;
        }
      });

      setStats(prev => ({ ...prev, revenueToday, revenueMonth, totalOrders }));
      setLoading(false);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(data);
      
      const lowStock = data.filter(p => (p.stock || 0) <= 5).sort((a, b) => a.stock - b.stock);
      setStats(prev => ({ ...prev, lowStock }));
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(d => d.id));
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubClients();
    };
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Visão Geral</h1>
        <p className="text-sm text-text-dim mt-1">Acompanhe suas vendas em tempo real</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-dim uppercase tracking-wide">Faturamento Hoje</p>
              <p className="text-xl font-black text-text-primary mt-2">{formatCurrency(stats.revenueToday)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(77,208,225,0.1)' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-neon-cyan)' }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-dim uppercase tracking-wide">Faturamento Mês</p>
              <p className="text-xl font-black text-text-primary mt-2">{formatCurrency(stats.revenueMonth)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(129,199,132,0.1)' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-neon-green)' }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-dim uppercase tracking-wide">Total Pedidos</p>
              <p className="text-xl font-black text-text-primary mt-2">{stats.totalOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(174,213,129,0.1)' }}>
              <ShoppingCart size={20} style={{ color: 'var(--color-neon-lime)' }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-dim uppercase tracking-wide">Clientes</p>
              <p className="text-xl font-black text-text-primary mt-2">{clients.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,184,0,0.1)' }}>
              <Users size={20} style={{ color: 'var(--color-neon-amber)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="glass-card p-5 rounded-xl lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} style={{ color: 'var(--color-neon-amber)' }} />
            <h3 className="font-bold text-text-primary">Estoque Baixo</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.lowStock.length > 0 ? stats.lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-bg-elevated overflow-hidden flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}
                </span>
              </div>
            )) : (
              <p className="text-sm text-text-dim text-center py-4">Todos os produtos com estoque OK.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-card p-5 rounded-xl lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} style={{ color: 'var(--color-neon-cyan)' }} />
            <h3 className="font-bold text-text-primary">Pedidos Recentes</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {orders.length > 0 ? orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${o.status === 'delivered' ? 'bg-neon-green' : o.status === 'pending' ? 'bg-neon-amber' : 'bg-neon-cyan'}`} />
                  <div>
                    <p className="text-sm font-bold text-text-primary">#{o.id} - {o.customerName || 'Cliente'}</p>
                    <p className="text-xs text-text-dim">{new Date(o.date).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-neon-lime)' }}>{formatCurrency(o.total || 0)}</p>
                  <span className="text-xs text-text-dim">{o.type === 'manual' ? 'PDV' : 'Online'}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-text-dim text-center py-4">Nenhum pedido registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
