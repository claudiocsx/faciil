import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, X } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';

const CATEGORIES = ['Smartwatches', 'Fones Bluetooth', 'Carregadores', 'Cabos', 'Capas', 'Películas'];

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProduct, updateProduct } = useProducts();
  const fileInputRef = useRef(null);
  
  const editingProduct = location.state;

  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price || '',
    costPrice: editingProduct?.costPrice || '',
    supplier: editingProduct?.supplier || '',
    originalPrice: editingProduct?.originalPrice || '',
    stock: editingProduct?.stock || '',
    category: editingProduct?.category || 'Smartwatches',
    image: editingProduct?.image || '',
    isNew: editingProduct?.isNew || false
  });
  const [imagePreview, setImagePreview] = useState(editingProduct?.image || null);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const compressImage = (file, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleSize = maxWidth / Math.max(img.width, img.height);
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const compressedBase64 = await compressImage(file);
    setImagePreview(compressedBase64);
    setFormData(prev => ({ ...prev, image: compressedBase64 }));
  };

  const handleFileInput = (e) => handleImageFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleImageFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert('Adicione uma imagem do produto.');
    
    setSaving(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        rating: 5.0,
        reviews: 0
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      navigate('/admin/products');
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
        <p className="text-text-dim">{editingProduct ? 'Atualize as informações do item' : 'Adicione um novo item ao catálogo'}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-dim mb-2">Foto do Produto</label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-white/5"
              style={{ borderColor: dragActive ? '#1DF2FF' : 'rgba(255,255,255,0.1)', backgroundColor: dragActive ? 'rgba(29,242,255,0.05)' : 'transparent' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <Upload size={28} className="mx-auto mb-2" style={{ color: '#1DF2FF' }} />
              <p className="text-text-primary font-semibold">Clique ou arraste uma imagem</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-text-dim">Nome do Produto</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Preço (R$)</label>
            <input type="number" name="price" required step="0.01" value={formData.price} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Preço Anterior</label>
            <input type="number" name="originalPrice" step="0.01" value={formData.originalPrice} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Preço de Custo</label>
            <input type="number" name="costPrice" step="0.01" value={formData.costPrice} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Fornecedor</label>
            <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Estoque</label>
            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Categoria</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-bg-elevated">{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: '#1DF2FF' }} />
          <span className="text-sm text-text-secondary">Marcar como Novo</span>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="flex-1 py-3 glass-card rounded-xl font-bold text-text-secondary">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-3 text-black rounded-xl font-bold disabled:opacity-50" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 10px rgba(57,255,20,0.4)' }}>
            {saving ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Salvar Produto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProductPage;
