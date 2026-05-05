import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { products, removeProduct } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Gestão de Produtos</h2>
          <p className="text-text-dim mt-1">{products.length} produtos cadastrados</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="px-6 py-3 text-black rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:shadow-lg"
          style={{ backgroundColor: '#3B8B9',  }}
        >
          + Novo Produto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="glass-card p-4 rounded-xl flex items-center gap-4 group">
            <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-bg-elevated" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-text-primary truncate">{p.name}</h4>
              <p className="text-sm font-bold" style={{ color: '#8AA82E' }}>R$ {p.price.toFixed(2)}</p>
              <p className="text-xs text-text-dim">Estoque: {p.stock}</p>
              {p.supplier && <p className="text-xs text-text-dim mt-1 truncate" style={{ color: '#3B8B9' }}>📦 {p.supplier}</p>}
              {p.costPrice && <p className="text-xs text-orange-400">Custo: R$ {p.costPrice.toFixed(2)}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => navigate('/admin/products/new', { state: p })}
                className="p-2 text-text-dim hover:text-neon-cyan hover:bg-white/10 rounded-lg transition-all"
                title="Editar produto"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => { if (confirm('Excluir este produto?')) removeProduct(p.id); }}
                className="p-2 text-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Remover produto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-text-dim col-span-3 py-8">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
