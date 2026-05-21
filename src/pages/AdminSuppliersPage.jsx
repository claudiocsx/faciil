import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Truck, Plus, Edit3, Trash2, X, Phone, Mail, FileText } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const AdminSuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', notes: '' });
  const { showConfirm } = useAlert();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'suppliers'), (snap) => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', contact: '', email: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name || '', contact: s.contact || '', email: s.email || '', notes: s.notes || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await updateDoc(doc(db, 'suppliers', editing.id), form);
    } else {
      await addDoc(collection(db, 'suppliers'), { ...form, createdAt: new Date().toISOString() });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    showConfirm('Excluir este fornecedor?', async () => {
      await deleteDoc(doc(db, 'suppliers', id));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1A2238' }}>Fornecedores</h2>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>{suppliers.length} fornecedores cadastrados</p>
        </div>
        <button onClick={openNew} className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:shadow-lg" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="p-5 rounded-xl transition-all hover:shadow-md" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                  <Truck size={20} style={{ color: '#FFB347' }} />
                </div>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: '#1A2238' }}>{s.name}</h4>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg transition-all hover:bg-gray-100" style={{ color: '#64748B' }} title="Editar">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-50" style={{ color: '#EF4444' }} title="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-xs" style={{ color: '#64748B' }}>
              {s.contact && <p className="flex items-center gap-2"><Phone size={14} /> {s.contact}</p>}
              {s.email && <p className="flex items-center gap-2"><Mail size={14} /> {s.email}</p>}
              {s.notes && <p className="flex items-center gap-2"><FileText size={14} /> {s.notes}</p>}
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <p className="text-center col-span-3 py-12 text-sm" style={{ color: '#94A3B8' }}>Nenhum fornecedor cadastrado ainda.</p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1A2238' }}>{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} style={{ color: '#64748B' }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>Nome *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)', color: '#1A2238' }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>Contato (WhatsApp/Telefone)</label>
                <input type="text" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)', color: '#1A2238' }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)', color: '#1A2238' }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)', color: '#1A2238' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ color: '#64748B', backgroundColor: '#F1F5F9' }}>Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>{editing ? 'Atualizar' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliersPage;
