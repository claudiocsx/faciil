import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Package, X } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const ICONS = [
  { name: 'Watch', label: 'Relógio' },
  { name: 'Headphones', label: 'Fone' },
  { name: 'Plug', label: 'Carregador' },
  { name: 'Cable', label: 'Cabo' },
  { name: 'Smartphone', label: 'Capa' },
  { name: 'Shield', label: 'Película' },
  { name: 'Tag', label: 'Tag' },
  { name: 'Box', label: 'Caixa' },
  { name: 'Zap', label: 'Raio' },
  { name: 'Tablet', label: 'Tablet' },
  { name: 'Laptop', label: 'Notebook' },
  { name: 'Camera', label: 'Câmera' },
  { name: 'Speaker', label: 'Caixa de Som' },
  { name: 'Gamepad2', label: 'Game' },
  { name: 'Battery', label: 'Bateria' },
];

const DEFAULT_CATEGORIES = [
  { name: 'Smartwatches', icon: 'Watch', order: 1 },
  { name: 'Fones Bluetooth', icon: 'Headphones', order: 2 },
  { name: 'Carregadores', icon: 'Plug', order: 3 },
  { name: 'Cabos', icon: 'Cable', order: 4 },
  { name: 'Capas', icon: 'Smartphone', order: 5 },
  { name: 'Películas', icon: 'Shield', order: 6 },
];

const IconComponent = ({ name, size = 20 }) => {
  const icons = {
    Watch: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="6" />
        <polyline points="12 10 12 12 13.5 13.5" />
        <path d="M16.6 16.6 18 18" />
        <path d="M19 12h1" />
        <path d="M20.4 6.6 19 5" />
        <path d="M12 3v1" />
        <path d="M7.4 4.4 6 3" />
        <path d="M3 12h1" />
        <path d="M4.4 17.6 6 19" />
      </svg>
    ),
    Headphones: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    Plug: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
      </svg>
    ),
    Cable: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4v16" />
        <path d="M12 4v16" />
        <path d="M20 4v8" />
        <path d="M20 8h-4" />
        <path d="M4 10h4" />
        <path d="M4 14h4" />
      </svg>
    ),
    Smartphone: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </svg>
    ),
    Shield: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    Tag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    Box: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    Zap: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    Tablet: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </svg>
    ),
    Laptop: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    Camera: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    Speaker: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <circle cx="12" cy="14" r="4" />
        <line x1="12" y1="6" x2="12" y2="6" />
      </svg>
    ),
    Gamepad2: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <circle cx="15" cy="10" r="1" />
        <circle cx="18" cy="13" r="1" />
        <path d="M17 12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Z" />
      </svg>
    ),
    Battery: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
        <line x1="23" y1="13" x2="23" y2="11" />
      </svg>
    ),
  };
  return icons[name] || icons.Box;
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Box' });
  const { showConfirm } = useAlert();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (cats.length === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          await addDoc(collection(db, 'categories'), cat);
        }
        loadCategories();
      } else {
        setCategories(cats);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), {
          name: formData.name,
          icon: formData.icon,
        });
      } else {
        await addDoc(collection(db, 'categories'), {
          name: formData.name,
          icon: formData.icon,
          order: categories.length + 1,
        });
      }
      setFormData({ name: '', icon: 'Box' });
      setEditingId(null);
      setShowForm(false);
      loadCategories();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Tem certeza que deseja excluir esta categoria?', async () => {
      try {
        await deleteDoc(doc(db, 'categories', id));
        loadCategories();
      } catch (err) {
        console.error('Erro ao excluir:', err);
      }
    });
  };

  const handleMove = async (index, direction) => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;

    const [moved] = newCats.splice(index, 1);
    newCats.splice(targetIndex, 0, moved);

    try {
      await Promise.all(
        newCats.map((cat, i) => updateDoc(doc(db, 'categories', cat.id), { order: i + 1 }))
      );
      loadCategories();
    } catch (err) {
      console.error('Erro ao reordenar:', err);
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, icon: cat.icon });
    setEditingId(cat.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: '#FFB347' }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A2238' }}>
            Categorias
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#64748B' }}>
            Gerencie as categorias dos produtos
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', icon: 'Box' });
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm"
          style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: '#1A2238' }}>
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} style={{ color: '#64748B' }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Smartwatches"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid rgba(0,0,0,0.06)',
                    color: '#1A2238',
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                  Ícone
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid rgba(0,0,0,0.06)',
                    color: '#1A2238',
                  }}
                >
                  {ICONS.map((ic) => (
                    <option key={ic.name} value={ic.name}>
                      {ic.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ color: '#64748B', backgroundColor: '#F1F5F9' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                >
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-1.5 sm:space-y-2">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-2.5 sm:p-4 rounded-xl"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} style={{ color: '#64748B' }} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-1.5 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} style={{ color: '#64748B' }} />
                </button>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,179,71,0.15)' }}
              >
                <IconComponent name={cat.icon} size={16} />
              </div>
              <span className="text-sm sm:text-base truncate" style={{ color: '#1A2238' }}>
                {cat.name}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleEdit(cat)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
                title="Editar"
              >
                <Pencil size={15} style={{ color: '#64748B' }} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg hover:bg-red-50"
                title="Excluir"
              >
                <Trash2 size={15} style={{ color: '#EF4444' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-text-dim mb-4" />
          <p className="text-text-dim">Nenhuma categoria encontrada</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
