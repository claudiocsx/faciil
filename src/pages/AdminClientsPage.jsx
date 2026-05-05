import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Search, User, Phone, MapPin, Edit } from 'lucide-react';

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ id: null, name: '', phone: '', neighborhood: '', address: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateDoc(doc(db, 'clients', formData.id), formData);
      } else {
        await addDoc(collection(db, 'clients'), formData);
      }
      setFormData({ id: null, name: '', phone: '', neighborhood: '', address: '' });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Excluir este cliente?')) {
      await deleteDoc(doc(db, 'clients', id));
    }
  };

  const handleEdit = (client) => {
    setFormData(client);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Clientes</h2>
          <p className="text-sm text-text-dim">{clients.length} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setFormData({ id: null, name: '', phone: '', neighborhood: '', address: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all"
          style={{ backgroundColor: '#FFB347',  }}
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="glass-card p-4 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-text-dim">Nome</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-dim">Telefone/WhatsApp</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text" required value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-dim">Bairro</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text" value={formData.neighborhood}
                  onChange={(e) => setFormData(p => ({ ...p, neighborhood: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-text-dim">Endereço Completo</label>
              <input
                type="text" value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-xs font-bold glass-card text-text-secondary">Cancelar</button>
            <button type="submit" className="flex-1 py-2 rounded-lg text-xs font-bold text-black" style={{ backgroundColor: '#1A2238' }}>Salvar</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text" placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div className="space-y-2">
        {filteredClients.map(client => (
          <div key={client.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">{client.name}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-text-dim">
                <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>
                {client.neighborhood && <span className="flex items-center gap-1"><MapPin size={12} /> {client.neighborhood}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(client)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-text-dim hover:text-neon-cyan">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(client.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-text-dim hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <p className="text-center text-text-dim py-8 text-sm">Nenhum cliente encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default AdminClientsPage;
