import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', type: 'percent', value: '', active: true });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) return;
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'coupons', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'coupons'), { ...formData, code: formData.code.toUpperCase() });
      }
      setFormData({ code: '', type: 'percent', value: '', active: true });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Excluir este cupom?')) {
      await deleteDoc(doc(db, 'coupons', id));
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    await updateDoc(doc(db, 'coupons', id), { active: !currentStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Cupons de Desconto</h2>
          <p className="text-sm text-text-dim mt-1">{coupons.length} cupom{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ code: '', type: 'percent', value: '', active: true }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all"
          style={{ backgroundColor: '#4DD0E1', boxShadow: '0 0 10px rgba(77,208,225,0.4)' }}
        >
          <Plus size={16} /> Novo Cupom
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-4 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-dim">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                placeholder="FACIIL10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-dim">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-dim">Valor</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                placeholder={formData.type === 'percent' ? '10' : '5.00'}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-xs font-bold glass-card text-text-secondary">Cancelar</button>
            <button type="submit" className="flex-1 py-2 rounded-lg text-xs font-bold text-black" style={{ backgroundColor: '#81C784' }}>Salvar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {coupons.map(coupon => (
          <div key={coupon.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">{coupon.code}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${coupon.active ? 'text-text-dim' : 'bg-red-500/10 text-red-400'}`}>
                  {coupon.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-xs text-text-dim mt-1">
                {coupon.type === 'percent' ? `${coupon.value}%` : `R$ ${parseFloat(coupon.value).toFixed(2)}`} de desconto
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleToggleActive(coupon.id, coupon.active)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title={coupon.active ? 'Desativar' : 'Ativar'}>
                {coupon.active ? <Check size={16} className="text-neon-green" /> : <X size={16} className="text-red-400" />}
              </button>
              <button onClick={() => handleDelete(coupon.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-text-dim hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCouponsPage;
