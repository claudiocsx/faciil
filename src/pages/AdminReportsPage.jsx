import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Download, Calendar, TrendingUp, Package, X, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

const AdminReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState(30);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - period);

    return orders.filter(o => {
      const orderDate = new Date(o.date);
      if (orderDate < startDate) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && o.paymentMethod !== paymentFilter) return false;
      if (typeFilter !== 'all' && o.type !== typeFilter) return false;
      return true;
    });
  }, [orders, period, statusFilter, paymentFilter, typeFilter]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = filteredOrders.length;
    let cancelled = 0;
    let delivered = 0;
    let pending = 0;
    let pix = 0, cash = 0, card = 0;
    let manual = 0, online = 0;

    const dailyRevenue = {};
    const productSales = {};

    filteredOrders.forEach(o => {
      const orderDate = new Date(o.date);
      const dayKey = orderDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (o.status !== 'cancelled') {
        totalRevenue += o.total || 0;
        if (o.paymentMethod === 'pix') pix++;
        else if (o.paymentMethod === 'cash') cash++;
        else if (o.paymentMethod === 'card') card++;

        if (o.type === 'manual') manual++;
        else online++;

        o.items?.forEach(item => {
          const key = item.name || 'Produto';
          productSales[key] = (productSales[key] || 0) + (item.quantity * item.price);
        });
      }

      if (o.status === 'cancelled') cancelled++;
      else if (o.status === 'delivered') delivered++;
      else pending++;

      dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + (o.total || 0);
    });

    const revenueData = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14);

    const statusData = [
      { name: 'Entregues', value: delivered, color: '#10B981' },
      { name: 'Pendentes', value: pending, color: '#FFB800' },
      { name: 'Cancelados', value: cancelled, color: '#EF4444' }
    ].filter(d => d.value > 0);

    const paymentData = [
      { name: 'Pix', value: pix, color: '#10B981' },
      { name: 'Dinheiro', value: cash, color: '#FFB347' },
      { name: 'Cartão', value: card, color: '#3B82F6' }
    ].filter(d => d.value > 0);

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, revenue]) => ({ name: name.length > 25 ? name.substring(0, 22) + '...' : name, revenue }));

    return {
      totalRevenue, totalOrders, cancelled, delivered, pending,
      revenueData, statusData, paymentData, topProducts,
      avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }, [filteredOrders]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setTypeFilter('all');
  };

  if (loading) return <div className="p-8 text-center text-text-dim">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Relatórios</h2>
          <p className="text-sm text-text-dim mt-1">Análise completa das vendas</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 rounded-lg text-sm font-bold outline-none"
          style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="all">Todos Status</option>
            <option value="pending">Pendente</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="all">Todas Formas</option>
            <option value="pix">Pix</option>
            <option value="cash">Dinheiro</option>
            <option value="card">Cartão</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="all">Todos Tipos</option>
            <option value="manual">PDV</option>
            <option value="online">Online</option>
          </select>
          {(statusFilter !== 'all' || paymentFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
              style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#EF4444' }}
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Receita Total</p>
          <p className="text-xl font-black text-neon-green mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Pedidos</p>
          <p className="text-xl font-black text-text-primary mt-1">{stats.totalOrders}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Ticket Médio</p>
          <p className="text-xl font-black text-text-primary mt-1">{formatCurrency(stats.avgTicket)}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Taxa Entrega</p>
          <p className="text-xl font-black text-text-primary mt-1">
            {stats.totalOrders > 0 ? Math.round((stats.delivered / stats.totalOrders) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Evolução da Receita</h3>
          {stats.revenueData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1A2238', border: 'none', borderRadius: 8, color: '#fff' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#FFB347" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-text-dim py-8">Sem dados no período</p>
          )}
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Pedidos por Status</h3>
          {stats.statusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={4}>
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-text-dim py-8">Sem dados</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Por Forma de Pagamento</h3>
          {stats.paymentData.length > 0 ? (
            <div className="space-y-3">
              {stats.paymentData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-text-primary">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{item.value} vendas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-dim py-4">Sem dados</p>
          )}
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Top Produtos por Receita</h3>
          {stats.topProducts.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-bold text-text-dim w-4">{i + 1}</span>
                    <span className="text-sm text-text-primary truncate">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-neon-green">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-dim py-4">Sem vendas</p>
          )}
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl">
        <h3 className="font-bold text-text-primary mb-4">Lista de Pedidos ({filteredOrders.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-2 text-text-dim font-medium">Data</th>
                <th className="text-left py-3 px-2 text-text-dim font-medium">Cliente</th>
                <th className="text-left py-3 px-2 text-text-dim font-medium">Tipo</th>
                <th className="text-left py-3 px-2 text-text-dim font-medium">Pagamento</th>
                <th className="text-left py-3 px-2 text-text-dim font-medium">Status</th>
                <th className="text-right py-3 px-2 text-text-dim font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 20).map(order => (
                <tr key={order.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                  <td className="py-3 px-2 text-text-secondary">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-2 text-text-primary font-medium">{order.customerName || 'Cliente'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.type === 'manual' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {order.type === 'manual' ? 'PDV' : 'Online'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-text-secondary capitalize">{order.paymentMethod || '-'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {order.status === 'delivered' ? 'Entregue' : order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-neon-green">{formatCurrency(order.total || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 20 && (
          <p className="text-center text-xs text-text-dim mt-3">Mostrando 20 de {filteredOrders.length} pedidos</p>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;