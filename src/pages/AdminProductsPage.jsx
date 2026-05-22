import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Upload, Star } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useAlert } from '../contexts/AlertContext';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { products, removeProduct, updateProduct } = useProducts();
  const { showConfirm } = useAlert();
  const toggleFeatured = (p) => {
    updateProduct(p.id, { featured: !p.featured });
  };

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
          style={{ backgroundColor: '#FFB347',  }}
        >
          + Novo Produto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => {
          const img = p.image || p.images?.[0];
          return (
            <div key={p.id} className="glass-card p-4 rounded-xl flex items-center gap-4 group">
              <div className="relative shrink-0">
                {img && !img.startsWith('blob:') ? (
                  <img src={img} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Upload size={20} className="text-gray-300" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFeatured(p); }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: p.featured ? '#FFB347' : 'rgba(255,255,255,0.15)' }}
                  title={p.featured ? 'Remover destaque' : 'Marcar como destaque'}
                >
                  <Star size={11} fill={p.featured ? '#1A2238' : 'transparent'} style={{ color: p.featured ? '#1A2238' : '#94A3B8' }} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-text-primary truncate">
                  {p.name}
                  {p.flashSale?.endsAt && new Date(p.flashSale.endsAt) > new Date() && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold align-middle" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                      ⚡ {p.flashSale.discountPercent || ''}%
                    </span>
                  )}
                </h4>
                <p className="text-sm font-bold" style={{ color: '#FFB347' }}>R$ {p.price.toFixed(2)}</p>
                <p className="text-xs text-text-dim">Estoque: {p.stock}</p>
                {p.supplier && <p className="text-xs text-text-dim mt-1 truncate" style={{ color: '#FFB347' }}>📦 {p.supplier}</p>}
                {p.costPrice > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span style={{ color: '#64748B' }}>Custo: R$ {p.costPrice.toFixed(2)}</span>
                    {p.profitMargin > 0 && (
                      <span className="font-bold" style={{ color: '#059669' }}>+{p.profitMargin}%</span>
                    )}
                  </div>
                )}
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
                  onClick={() => showConfirm('Excluir este produto?', () => removeProduct(p.id))}
                  className="p-2 text-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Remover produto"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <p className="text-center text-text-dim col-span-3 py-8">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
