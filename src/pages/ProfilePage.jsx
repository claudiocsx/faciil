import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Package, DollarSign, ShoppingBag, Edit2, Check, X, Calendar, Mail, Shield, Phone, Save } from 'lucide-react';

const statusStyles = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  preparing: { bg: '#E0E7FF', text: '#3730A3' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const roleLabels = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'config', 'whatsapp'));
      if (snap.exists()) setWhatsapp(snap.data().number || '');
    };
    load();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrders = orders.length;

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { name: name.trim() });
      setEditing(false);
    } catch (err) {
      console.error('Erro ao salvar nome:', err);
    }
    setSaving(false);
  };

  const handleSaveWhatsapp = async () => {
    const clean = whatsapp.replace(/\D/g, '');
    if (!clean) return;
    try {
      await setDoc(doc(db, 'config', 'whatsapp'), { number: clean });
      alert('WhatsApp salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar WhatsApp:', err);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#1A2238' }}>Meu Perfil</h2>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Gerencie suas informações e acompanhe o desempenho</p>
      </div>

      <div className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center font-black text-2xl shrink-0" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-lg font-bold outline-none"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #FFB347', color: '#1A2238' }}
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-1.5 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                  </button>
                  <button onClick={() => { setEditing(false); setName(user?.name); }} className="p-1.5 rounded-lg transition-all" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold" style={{ color: '#1A2238' }}>{user?.name}</h3>
                  <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: '#F8FAFC', color: '#94A3B8' }}>
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mt-2 text-sm" style={{ color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><Mail size={14} /> {user?.email}</span>
              <span className="hidden sm:block">•</span>
              <span className="flex items-center gap-1.5"><Shield size={14} /> {roleLabels[user?.role] || user?.role}</span>
              <span className="hidden sm:block">•</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Desde {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F0FFF4', color: '#10B981' }}>
            <Phone size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#1A2238' }}>WhatsApp da Loja</h3>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Número usado para receber pedidos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="5511999999999"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
          />
          <button onClick={handleSaveWhatsapp} className="px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 flex items-center gap-2" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl flex items-center gap-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF7ED', color: '#FFB347' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-2xl font-black" style={{ color: '#1A2238' }}>{totalOrders}</p>
            <p className="text-xs font-semibold uppercase" style={{ color: '#94A3B8' }}>Total de Pedidos</p>
          </div>
        </div>
        <div className="p-5 rounded-xl flex items-center gap-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF7ED', color: '#FFB347' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-2xl font-black" style={{ color: '#1A2238' }}>R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-xs font-semibold uppercase" style={{ color: '#94A3B8' }}>Receita Total</p>
          </div>
        </div>
        <div className="p-5 rounded-xl flex items-center gap-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF7ED', color: '#FFB347' }}>
            <Package size={22} />
          </div>
          <div>
            <p className="text-2xl font-black" style={{ color: '#1A2238' }}>{orders.filter(o => o.status === 'delivered').length}</p>
            <p className="text-xs font-semibold uppercase" style={{ color: '#94A3B8' }}>Entregues</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          <h3 className="font-bold" style={{ color: '#1A2238' }}>Últimos Pedidos</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={32} className="mx-auto mb-2" style={{ color: '#CBD5E1' }} />
            <p className="text-sm" style={{ color: '#94A3B8' }}>Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
            {orders.slice(0, 10).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#1A2238' }}>{order.customerName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                    {order.items?.length || 0} item(ns) • {order.date ? new Date(order.date).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-bold" style={{ color: '#1A2238' }}>R$ {(order.total || 0).toFixed(2)}</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ ...(statusStyles[order.status] || statusStyles.pending) }}>
                    {order.status === 'pending' ? 'Pendente' :
                     order.status === 'confirmed' ? 'Confirmado' :
                     order.status === 'preparing' ? 'Preparando' :
                     order.status === 'delivered' ? 'Entregue' :
                     order.status === 'cancelled' ? 'Cancelado' : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
