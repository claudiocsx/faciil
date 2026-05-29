import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Upload,
  DollarSign,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setLoading(false);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubClients = onSnapshot(collection(db, 'customers'), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubClients();
    };
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let revenueToday = 0;
    let revenueMonth = 0;
    let revenueWeek = 0;
    let totalOrders = 0;
    let ordersToday = 0;
    let cancelledOrders = 0;
    let pixCount = 0,
      cashCount = 0,
      cardCount = 0;

    const dailyRevenue = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyRevenue[d.toDateString()] = {
        day: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        revenue: 0,
        orders: 0,
      };
    }

    const productSales = {};

    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        totalOrders++;
        const orderDate = new Date(o.date);
        const amount = o.total || 0;

        if (orderDate.toDateString() === today.toDateString()) {
          revenueToday += amount;
          ordersToday++;
        }
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          revenueMonth += amount;
        }
        if (orderDate >= sevenDaysAgo) {
          revenueWeek += amount;
          const dayKey = orderDate.toDateString();
          if (dailyRevenue[dayKey]) {
            dailyRevenue[dayKey].revenue += amount;
            dailyRevenue[dayKey].orders += 1;
          }
        }

        if (o.paymentMethod === 'pix') pixCount++;
        else if (o.paymentMethod === 'cash') cashCount++;
        else if (o.paymentMethod === 'card') cardCount++;

        o.items?.forEach((item) => {
          const key = item.name || 'Produto';
          productSales[key] = (productSales[key] || 0) + item.quantity;
        });
      } else {
        cancelledOrders++;
      }
    });

    const weeklyData = Object.values(dailyRevenue);
    const paymentData = [
      { name: 'Pix', value: pixCount, color: '#10B981' },
      { name: 'Dinheiro', value: cashCount, color: '#FFB347' },
      { name: 'Cartão', value: cardCount, color: '#3B82F6' },
    ].filter((d) => d.value > 0);

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({
        name: name.length > 20 ? name.substring(0, 17) + '...' : name,
        quantity,
      }));

    const lowStock = products.filter((p) => (p.stock || 0) <= 5).sort((a, b) => a.stock - b.stock);

    const avgTicket = totalOrders > 0 ? revenueMonth / totalOrders : 0;
    const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    return {
      revenueToday,
      revenueMonth,
      revenueWeek,
      totalOrders,
      ordersToday,
      lowStock,
      clients: clients.length,
      weeklyData,
      paymentData,
      topProducts,
      avgTicket,
      cancelRate,
    };
  }, [orders, products, clients]);

  if (loading) return <div className="p-8 text-center text-text-dim">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Visão Geral</h1>
        <p className="text-sm text-text-dim mt-1">Acompanhe suas vendas em tempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Faturamento Hoje</p>
          <p className="text-xl font-black text-text-primary mt-1">
            {formatCurrency(stats.revenueToday)}
          </p>
          <p className="text-xs text-neon-cyan mt-1">{stats.ordersToday} pedidos</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Faturamento Mês</p>
          <p className="text-xl font-black text-text-primary mt-1">
            {formatCurrency(stats.revenueMonth)}
          </p>
          <p className="text-xs text-text-dim mt-1">{stats.totalOrders} pedidos</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Ticket Médio</p>
          <p className="text-xl font-black text-text-primary mt-1">
            {formatCurrency(stats.avgTicket)}
          </p>
          <p className="text-xs text-text-dim mt-1">por pedido</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs font-medium text-text-dim uppercase">Clientes</p>
          <p className="text-xl font-black text-text-primary mt-1">{stats.clients}</p>
          <p className="text-xs text-text-dim mt-1">cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl lg:col-span-2">
          <h3 className="font-bold text-text-primary mb-4">Faturamento Semanal (Últimos 7 dias)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$ ${v}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1A2238',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Bar dataKey="revenue" fill="#FFB347" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Por Forma de Pagamento</h3>
          {stats.paymentData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {stats.paymentData.map((entry, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} style={{ color: '#FFB347' }} />
            <h3 className="font-bold text-text-primary">Estoque Baixo</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.lowStock.length > 0 ? (
              stats.lowStock.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <p className="text-sm text-text-primary truncate flex-1">{p.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                  >
                    {p.stock === 0 ? '0' : p.stock}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-dim text-center py-4">Estoque OK</p>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Top Produtos Vendidos</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-dim w-4">{i + 1}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-neon-cyan"
                      style={{ width: `${(p.quantity / stats.topProducts[0].quantity) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-primary font-medium w-8 text-right">
                    {p.quantity}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-dim text-center py-4">Sem vendas</p>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h3 className="font-bold text-text-primary mb-4">Pedidos Recentes</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary">#{o.id.substring(0, 6)}</p>
                  <p className="text-xs text-text-dim">
                    {new Date(o.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${o.status === 'delivered' ? 'bg-green-500/20 text-green-400' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                >
                  {o.status === 'delivered'
                    ? 'Entregue'
                    : o.status === 'cancelled'
                      ? 'Cancelado'
                      : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
