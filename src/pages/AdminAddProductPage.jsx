import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, X, Star, ImagePlus } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import ProfitCalculator from '../components/ProfitCalculator';
import { useAlert } from '../contexts/AlertContext';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProduct, updateProduct } = useProducts();
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  
  const editingProduct = location.state;
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      setCategories(snap.docs.map(d => d.data().name));
    };
    const loadSuppliers = async () => {
      const snap = await getDocs(collection(db, 'suppliers'));
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadCategories();
    loadSuppliers();
  }, []);

  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price || '',
    costPrice: editingProduct?.costPrice || '',
    profitMargin: editingProduct?.profitMargin || '',
    supplier: editingProduct?.supplier || '',
    originalPrice: editingProduct?.originalPrice || '',
    stock: editingProduct?.stock || '',
    category: editingProduct?.category || (categories[0] || 'Smartwatches'),
    image: editingProduct?.image || editingProduct?.images?.[0] || '',
    images: editingProduct?.images || [],
    isNew: editingProduct?.isNew || false,
    comingSoon: editingProduct?.comingSoon || false,
    featured: editingProduct?.featured || false
  });
  const [imagePreview, setImagePreview] = useState(editingProduct?.image || editingProduct?.images?.[0] || null);
  const [galleryPreviews, setGalleryPreviews] = useState(editingProduct?.images || []);
  const [dragActive, setDragActive] = useState(false);
  const [galleryDragActive, setGalleryDragActive] = useState(Array(3).fill(false));
  const galleryRefs = useRef([null, null, null]);
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

          const isTransparent = file.type === 'image/png' || file.type === 'image/webp';

          if (!isTransparent) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const mimeType = isTransparent ? file.type : 'image/jpeg';
          resolve(canvas.toDataURL(mimeType, quality));
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

  const handleGalleryFile = async (file, index) => {
    if (!file || !file.type.startsWith('image/')) return;
    const compressedBase64 = await compressImage(file);

    const newPreviews = [...galleryPreviews];
    newPreviews[index] = compressedBase64;
    setGalleryPreviews(newPreviews);

    const newFormImages = [...(formData.images || [])];
    newFormImages[index] = compressedBase64;
    setFormData(prev => ({ ...prev, images: newFormImages }));
  };

  const handleFileInput = (e) => handleImageFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleImageFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const handleGalleryDrop = (e, index) => {
    e.preventDefault();
    const newActive = [...galleryDragActive];
    newActive[index] = false;
    setGalleryDragActive(newActive);
    handleGalleryFile(e.dataTransfer.files[0], index);
  };
  const handleGalleryDragOver = (e, index) => {
    e.preventDefault();
    const newActive = [...galleryDragActive];
    newActive[index] = true;
    setGalleryDragActive(newActive);
  };
  const handleGalleryDragLeave = (index) => {
    const newActive = [...galleryDragActive];
    newActive[index] = false;
    setGalleryDragActive(newActive);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const removeGalleryImage = (index) => {
    const newPreviews = [...galleryPreviews];
    newPreviews[index] = undefined;
    setGalleryPreviews(newPreviews);

    const newFormImages = [...(formData.images || [])];
    newFormImages[index] = undefined;
    setFormData(prev => ({ ...prev, images: newFormImages }));
  };

  const handleProfitChange = ({ costPrice, profitMargin, price }) => {
    setFormData(prev => ({
      ...prev,
      costPrice: costPrice !== '' ? costPrice : prev.costPrice,
      profitMargin: profitMargin !== '' ? profitMargin : prev.profitMargin,
      price: price !== '' ? price : prev.price,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct && !formData.image) return showAlert('Adicione uma imagem do produto.');
    
    setSaving(true);
    try {
      const galleryImages = (formData.images || []).filter(Boolean);
      const productData = {
        ...formData,
        images: galleryImages,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        profitMargin: formData.profitMargin ? parseFloat(formData.profitMargin) : null,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        featured: formData.featured,
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
      showAlert(err.message);
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
            <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }}>
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
              style={{ borderColor: dragActive ? '#1DF2FF' : 'rgba(0,0,0,0.12)', backgroundColor: dragActive ? 'rgba(29,242,255,0.05)' : '#F8FAFC' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <Upload size={28} className="mx-auto mb-2" style={{ color: '#1DF2FF' }} />
              <p className="text-text-primary font-semibold">Clique ou arraste uma imagem</p>
            </div>
          )}
        </div>

        {/* Galeria de Imagens */}
        <div>
          <label className="block text-sm font-medium text-text-dim mb-2">Imagens da Galeria (opcional — até 3)</label>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                {galleryPreviews[i] ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <img src={galleryPreviews[i]} alt="" className="w-full aspect-square object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={(e) => handleGalleryDrop(e, i)}
                    onDragOver={(e) => handleGalleryDragOver(e, i)}
                    onDragLeave={() => handleGalleryDragLeave(i)}
                    onClick={() => galleryRefs.current[i]?.click()}
                    className="relative border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/5"
                    style={{ borderColor: galleryDragActive[i] ? '#1DF2FF' : 'rgba(0,0,0,0.12)', backgroundColor: galleryDragActive[i] ? 'rgba(29,242,255,0.05)' : '#F8FAFC' }}
                  >
                    <input ref={(el) => { galleryRefs.current[i] = el; }} type="file" accept="image/*" onChange={(e) => handleGalleryFile(e.target.files[0], i)} className="hidden" />
                    <ImagePlus size={22} style={{ color: '#94A3B8' }} />
                    <span className="text-xs mt-1" style={{ color: '#94A3B8' }}>Foto {i + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-text-dim">Nome do Produto</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Preço (R$)</label>
            <input type="number" name="price" required step="0.01" value={formData.price} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Preço Anterior</label>
            <input type="number" name="originalPrice" step="0.01" value={formData.originalPrice} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }} />
          </div>
          <div className="md:col-span-2">
            <ProfitCalculator
              costPrice={formData.costPrice}
              profitMargin={formData.profitMargin}
              price={formData.price}
              onChange={handleProfitChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Fornecedor</label>
            <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} list="supplier-list" className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }} />
            <datalist id="supplier-list">
              {suppliers.map(s => <option key={s.id} value={s.name} />)}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Estoque</label>
            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-dim">Categoria</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-text-primary outline-none" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }}>
              {categories.map(c => <option key={c} value={c} className="bg-bg-elevated">{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: '#FFB347' }} />
          <span className="text-sm text-text-secondary">Marcar como Novo</span>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="comingSoon" checked={formData.comingSoon} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: '#FFB347' }} />
          <span className="text-sm text-text-secondary">Produto a caminho (Em breve)</span>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 rounded" style={{ accentColor: '#FFB347' }} />
          <Star size={16} style={{ color: '#FFB347' }} />
          <span className="text-sm" style={{ color: '#1A2238' }}>Produto em Destaque (aparece no topo da loja)</span>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="flex-1 py-3 glass-card rounded-xl font-bold text-text-secondary">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-3 text-black rounded-xl font-bold disabled:opacity-50" style={{ backgroundColor: '#FFB347' }}>
            {saving ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Salvar Produto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProductPage;