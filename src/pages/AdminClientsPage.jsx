import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Search, Phone } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      showAlert(err.message);
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Excluir este cliente?', async () => {
      await deleteDoc(doc(db, 'customers', id));
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Clientes</h2>
          <p className="text-sm text-text-dim">{clients.length} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

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
                {client.phone && <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>}
                {client.email && <span className="flex items-center gap-1"><span style={{fontSize:'10px'}}>📧</span> {client.email}</span>}
              </div>
              {client.createdAt && (
                <p className="text-xs text-text-dim mt-1">Cadastrado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
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
