import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Image, Tag, Percent, Truck, Trash2, Edit, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import LoadingScreen from '../components/LoadingScreen';
import { useAlert } from '../contexts/AlertContext';

const AdminBannersPage = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const [offerForm, setOfferForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    productId: '',
    productName: '',
  });
  const [uploading, setUploading] = useState(false);

  const compressImage = (file, maxSize = 800, quality = 0.7) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
          if (height > width && height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent',
    value: '',
    active: true,
    color: '#1A2238',
  });

  useEffect(() => {
    loadData();
    const closeDropdown = () => setProductDropdownOpen(false);
    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  const loadData = async () => {
    try {
      const offerSnap = await getDocs(collection(db, 'banners_offers'));
      const couponSnap = await getDocs(collection(db, 'coupons'));
      const productSnap = await getDocs(collection(db, 'products'));

      setOffers(offerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCoupons(couponSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setProducts(productSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Erro ao carregar:', err);
    }
    setLoading(false);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'banners_offers', editingItem.id), offerForm);
      } else {
        await addDoc(collection(db, 'banners_offers'), offerForm);
      }
      setOfferForm({ title: '', subtitle: '', image: '', productId: '', productName: '' });
      setShowOfferForm(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      showAlert('Erro ao salvar: ' + err.message);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code) return;
    if (couponForm.type !== 'freight' && !couponForm.value) {
      showAlert('Preencha o valor do desconto');
      return;
    }
    try {
      const data = {
        ...couponForm,
        code: couponForm.code.toUpperCase(),
        value: couponForm.type === 'freight' ? 0 : Number(couponForm.value),
        active: true,
      };
      if (editingItem) {
        await updateDoc(doc(db, 'coupons', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'coupons'), data);
      }
      setCouponForm({ code: '', type: 'percent', value: '', active: true, color: '#1A2238' });
      setShowCouponForm(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      showAlert('Erro ao salvar: ' + err.message);
    }
  };

  const handleDeleteOffer = async (id) => {
    showConfirm('Excluir esta oferta?', async () => {
      await deleteDoc(doc(db, 'banners_offers', id));
      loadData();
    });
  };

  const handleDeleteCoupon = async (id) => {
    showConfirm('Excluir este cupom?', async () => {
      await deleteDoc(doc(db, 'coupons', id));
      loadData();
    });
  };

  const editOffer = (offer) => {
    setOfferForm(offer);
    setEditingItem(offer);
    setShowOfferForm(true);
  };

  const editCoupon = (coupon) => {
    setCouponForm({
      code: coupon.code,
      type: coupon.type || 'percent',
      value: coupon.value || '',
      active: coupon.active ?? true,
      color: coupon.color || '#1A2238',
    });
    setEditingItem(coupon);
    setShowCouponForm(true);
  };

  if (loading) {
    return <LoadingScreen message="Carregando banners..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: '#1A2238' }}>
            Gerenciar Banners
          </h2>
          <p style={{ color: '#94A3B8' }}>Ofertas e cupons do carrossel</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 rounded-xl font-bold text-sm"
          style={{
            backgroundColor: '#F8FAFC',
            color: '#1A2238',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          Voltar
        </button>
      </div>

      {/* Ofertas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1A2238' }}>
            <Image size={20} style={{ color: '#FFB347' }} />
            Ofertas do Carrossel
          </h3>
          <button
            onClick={() => {
              setShowOfferForm(true);
              setEditingItem(null);
              setOfferForm({ title: '', subtitle: '', image: '', productId: '', productName: '' });
              setProductSearch('');
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
          >
            <Plus size={16} /> Nova Oferta
          </button>
        </div>

        {showOfferForm && (
          <form
            onSubmit={handleSaveOffer}
            className="mb-4 p-4 rounded-xl"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                placeholder="Título (opcional)"
                className="px-3 py-2 rounded-xl text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.04)',
                  color: '#1A2238',
                }}
              />
              <input
                type="text"
                value={offerForm.subtitle}
                onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                placeholder="Subtítulo (opcional)"
                className="px-3 py-2 rounded-xl text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.04)',
                  color: '#1A2238',
                }}
              />
            </div>
            <div className="mb-3">
              <label
                className="flex items-center justify-center gap-2 w-full px-3 py-4 rounded-xl text-sm cursor-pointer transition-all hover:opacity-80"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px dashed rgba(0,0,0,0.15)',
                  color: '#94A3B8',
                }}
              >
                <Image size={18} />
                <span>
                  {offerForm.image ? 'Imagem selecionada' : 'Clique para selecionar imagem'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploading(true);
                      const base64 = await compressImage(file);
                      setOfferForm({ ...offerForm, image: base64 });
                      setUploading(false);
                    }
                  }}
                />
              </label>
              {uploading && (
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  Comprimindo imagem...
                </p>
              )}
              {offerForm.image && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={offerForm.image}
                    alt="Preview"
                    loading="lazy"
                    decoding="async"
                    className="h-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setOfferForm({ ...offerForm, image: '' })}
                    className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white"
                    style={{ lineHeight: 0 }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Vinculo com Produto */}
            <div className="mb-3 relative">
              <label
                className="text-xs font-medium mb-1 flex items-center gap-1"
                style={{ color: '#64748B' }}
              >
                Vincular a um produto (opcional)
                {products.length > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}
                  >
                    {products.length} produtos
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={offerForm.productName || productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setProductDropdownOpen(true);
                    if (!e.target.value)
                      setOfferForm({ ...offerForm, productId: '', productName: '' });
                  }}
                  onFocus={() => setProductDropdownOpen(true)}
                  placeholder="Digite o nome do produto..."
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.04)',
                    color: '#1A2238',
                  }}
                />
                {offerForm.productId && (
                  <button
                    type="button"
                    onClick={() => {
                      setOfferForm({ ...offerForm, productId: '', productName: '' });
                      setProductSearch('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X size={14} style={{ color: '#94A3B8' }} />
                  </button>
                )}
              </div>
              {productDropdownOpen && products.length > 0 && (
                <div
                  className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl shadow-lg"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  {products
                    .filter(
                      (p) =>
                        !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setOfferForm({ ...offerForm, productId: p.id, productName: p.name });
                          setProductSearch(p.name);
                          setProductDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b last:border-0"
                        style={{ color: '#1A2238', borderColor: 'rgba(0,0,0,0.04)' }}
                      >
                        {p.name}
                      </button>
                    ))}
                  {products.filter(
                    (p) =>
                      !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="px-3 py-2 text-sm" style={{ color: '#94A3B8' }}>
                      Nenhum produto encontrado com esse nome
                    </p>
                  )}
                </div>
              )}
              {productDropdownOpen && products.length === 0 && (
                <div
                  className="absolute z-50 mt-1 w-full rounded-xl shadow-lg p-3 text-sm text-center"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    color: '#EF4444',
                  }}
                >
                  Nenhum produto encontrado. Crie produtos primeiro.
                </div>
              )}
              {offerForm.productName && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#10B981' }}>
                  <ExternalLink size={10} /> Vinculado a: {offerForm.productName}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOfferForm(false)}
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#94A3B8',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!offerForm.image || uploading}
                className="flex-1 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
                style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
              >
                {uploading ? 'Enviando...' : editingItem ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <img
                src={offer.image}
                alt={offer.title}
                loading="lazy"
                decoding="async"
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate" style={{ color: '#1A2238' }}>
                  {offer.title || 'Sem título'}
                </h4>
                <p className="text-xs" style={{ color: '#FFB347' }}>
                  {offer.subtitle}
                </p>
                {offer.productName && (
                  <p
                    className="text-xs mt-0.5 flex items-center gap-1"
                    style={{ color: '#10B981' }}
                  >
                    <ExternalLink size={10} /> {offer.productName}
                  </p>
                )}
                <div className="flex gap-1 mt-1">
                  <button onClick={() => editOffer(offer)} className="p-1 rounded hover:bg-black/5">
                    <Edit size={12} style={{ color: '#94A3B8' }} />
                  </button>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={12} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <p className="col-span-2 text-center py-4 text-sm" style={{ color: '#94A3B8' }}>
              Nenhuma oferta cadastrada
            </p>
          )}
        </div>
      </div>

      {/* Cupons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1A2238' }}>
            <Tag size={20} style={{ color: '#FFB347' }} />
            Cupons de Desconto
          </h3>
          <button
            onClick={() => {
              setShowCouponForm(true);
              setEditingItem(null);
              setCouponForm({
                code: '',
                type: 'percent',
                value: '',
                active: true,
                color: '#1A2238',
              });
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
          >
            <Plus size={16} /> Novo Cupom
          </button>
        </div>

        {showCouponForm && (
          <form
            onSubmit={handleSaveCoupon}
            className="mb-4 p-4 rounded-xl space-y-3"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                }
                placeholder="Código (ex: FACIIL10)"
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.04)',
                  color: '#1A2238',
                }}
                required
              />
              <select
                value={couponForm.type}
                onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.04)',
                  color: '#1A2238',
                }}
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
                <option value="freight">Frete Grátis</option>
              </select>
              {couponForm.type !== 'freight' && (
                <input
                  type="number"
                  value={couponForm.value}
                  onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                  placeholder={
                    couponForm.type === 'percent' ? 'Valor % (ex: 10)' : 'Valor R$ (ex: 5)'
                  }
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.04)',
                    color: '#1A2238',
                  }}
                  required={couponForm.type !== 'freight'}
                />
              )}
              <input
                type="text"
                value={couponForm.color}
                onChange={(e) => setCouponForm({ ...couponForm, color: e.target.value })}
                placeholder="Cor (ex: #1A2238)"
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.04)',
                  color: '#1A2238',
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCouponForm(false)}
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#94A3B8',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
              >
                {editingItem ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                backgroundColor: coupon.color || '#1A2238',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div>
                <span
                  className="font-black text-lg"
                  style={{ color: coupon.color === '#FFB347' ? '#1A2238' : '#FFFFFF' }}
                >
                  {coupon.code}
                </span>
                <p
                  className="text-xs font-bold"
                  style={{ color: coupon.color === '#FFB347' ? '#1A2238' : '#FFFFFF' }}
                >
                  {coupon.type === 'freight'
                    ? 'Frete Grátis'
                    : coupon.type === 'percent'
                      ? `${coupon.value}% OFF`
                      : `R$ ${parseFloat(coupon.value).toFixed(2)} OFF`}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => editCoupon(coupon)}
                  className="p-1 rounded hover:bg-black/10"
                >
                  <Edit
                    size={12}
                    style={{ color: coupon.color === '#FFB347' ? '#1A2238' : '#FFFFFF' }}
                  />
                </button>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-1 rounded hover:bg-red-50"
                >
                  <Trash2 size={12} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="col-span-2 text-center py-4 text-sm" style={{ color: '#94A3B8' }}>
              Nenhum cupom cadastrado
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBannersPage;
