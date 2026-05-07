import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, Plus } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';

const CATEGORIES = ['Smartwatches', 'Fones Bluetooth', 'Carregadores', 'Cabos', 'Capas', 'Películas'];
const MAX_IMAGES = 4;

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProduct, updateProduct } = useProducts();
  const fileInputRef = useRef(null);
  const extraFileInputRef = useRef(null);
  
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
    images: editingProduct?.images || [],
    isNew: editingProduct?.isNew || false
  });
  const [imagePreview, setImagePreview] = useState(editingProduct?.image || null);
  const [extraImages, setExtraImages] = useState(editingProduct?.images || []);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageFile = (file) => {
    console.log('handleImageFile called with:', file?.name, file?.type);
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('FileReader loaded, result length:', e.target.result?.length);
      const result = e.target.result;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    console.log('handleFileInput called with files:', e.target.files);
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleExtraImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (extraImages.length >= MAX_IMAGES) return alert(`Máximo de ${MAX_IMAGES} imagens extras.`);
    const reader = new FileReader();
    reader.onload = (e) => {
      setExtraImages(prev => [...prev, e.target.result]);
      setFormData(prev => ({ ...prev, images: [...prev.images, e.target.result] }));
    };
    reader.readAsDataURL(file);
  };

  const removeExtraImage = (index) => {
    const newImages = extraImages.filter((_, i) => i !== index);
    setExtraImages(newImages);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleExtraFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleExtraImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalImage = imagePreview || formData.image;
    console.log('handleSubmit - imagePreview:', imagePreview ? 'SIM' : 'NÃO');
    console.log('handleSubmit - formData.image:', formData.image ? 'SIM' : 'NÃO');
    console.log('handleSubmit - finalImage:', finalImage ? 'SIM' : 'NÃO');
    
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...formData, image: finalImage, images: extraImages });
      } else {
        await addProduct({ ...formData, image: finalImage, images: extraImages, price: parseFloat(formData.price), costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null, originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null, stock: parseInt(formData.stock), rating: 5.0, reviews: 0 });
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
        <h2 className="text-2xl font-black" style={{ color: '#1A2238' }}>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
        <p style={{ color: '#94A3B8' }}>{editingProduct ? 'Atualize as informações do item' : 'Adicione um novo item ao catálogo'}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#1A2238' }}>Foto Principal do Produto</label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                style={{ borderColor: dragActive ? '#FFB347' : 'rgba(0,0,0,0.1)', backgroundColor: '#FFFFFF' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto mb-2" style={{ color: '#FFB347' }} />
                <p className="font-semibold" style={{ color: '#1A2238' }}>Toque para selecionar foto</p>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>JPG ou PNG</p>
              </label>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*"
                onChange={handleFileInput} 
                className="hidden" 
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#1A2238' }}>
            Fotos Adicionais ({extraImages.length}/{MAX_IMAGES})
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {extraImages.map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-square">
                <img src={img} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeExtraImage(i)} 
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {extraImages.length < MAX_IMAGES && (
              <label
                className="block aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                style={{ borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#FFFFFF' }}
                onClick={() => extraFileInputRef.current?.click()}
              >
                <input 
                  ref={extraFileInputRef} 
                  type="file" 
                  accept="image/*"
                  onChange={handleExtraFileInput} 
                  className="hidden" 
                />
                <Plus size={20} style={{ color: '#FFB347' }} />
                <span className="text-[10px]" style={{ color: '#94A3B8' }}>Adicionar</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Nome do Produto</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }} />
          </div>
          <div>
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Preço (R$)</label>
            <input type="number" name="price" required step="0.01" value={formData.price} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }} />
          </div>
          <div>
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Preço Anterior</label>
            <input type="number" name="originalPrice" step="0.01" value={formData.originalPrice} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }} />
          </div>
          <div>
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Preço de Custo</label>
            <input type="number" name="costPrice" step="0.01" value={formData.costPrice} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }} />
          </div>
          <div>
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Fornecedor</label>
            <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }} />
          </div>
          <div>
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Estoque</label>
            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }} />
          </div>
          <div>
            <label className="text-sm font-bold" style={{ color: '#1A2238' }}>Categoria</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: '#FFB347' }} />
          <span className="text-sm text-text-secondary">Marcar como Novo</span>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="flex-1 py-3 rounded-xl font-bold" style={{ backgroundColor: '#F8FAFC', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }}>Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold disabled:opacity-50" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
            {saving ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Salvar Produto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProductPage;