import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Image, Tag, Percent, Trash2, Edit } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import LoadingScreen from '../components/LoadingScreen';

const AdminBannersPage = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [offerForm, setOfferForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '#products-section'
  });
  const [uploading, setUploading] = useState(false);

  const compressImage = (file, maxSize = 800, quality = 0.7) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
          if (height > width && height > maxSize) { width *= maxSize / height; height = maxSize; }
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
    discount: '',
    color: '#1A2238'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const offerSnap = await getDocs(collection(db, 'banners_offers'));
      const couponSnap = await getDocs(collection(db, 'banners_coupons'));
      
      setOffers(offerSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCoupons(couponSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      setOfferForm({ title: '', subtitle: '', image: '', link: '#products-section' });
      setShowOfferForm(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'banners_coupons', editingItem.id), couponForm);
      } else {
        await addDoc(collection(db, 'banners_coupons'), couponForm);
      }
      setCouponForm({ code: '', discount: '', color: '#1A2238' });
      setShowCouponForm(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (confirm('Excluir esta oferta?')) {
      await deleteDoc(doc(db, 'banners_offers', id));
      loadData();
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (confirm('Excluir este cupom?')) {
      await deleteDoc(doc(db, 'banners_coupons', id));
      loadData();
    }
  };

  const editOffer = (offer) => {
    setOfferForm(offer);
    setEditingItem(offer);
    setShowOfferForm(true);
  };

  const editCoupon = (coupon) => {
    setCouponForm(coupon);
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
          <h2 className="text-2xl font-black" style={{ color: '#1A2238' }}>Gerenciar Banners</h2>
          <p style={{ color: '#94A3B8' }}>Ofertas e cupons do carrossel</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 rounded-xl font-bold text-sm"
          style={{ backgroundColor: '#F8FAFC', color: '#1A2238', border: '1px solid rgba(0,0,0,0.04)' }}
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
            onClick={() => { setShowOfferForm(true); setEditingItem(null); setOfferForm({ title: '', subtitle: '', image: '', link: '#products-section' }); }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
          >
            <Plus size={16} /> Nova Oferta
          </button>
        </div>

            {showOfferForm && (
              <form onSubmit={handleSaveOffer} className="mb-4 p-4 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder="Título"
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                    required
                  />
                  <input
                    type="text"
                    value={offerForm.subtitle}
                    onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                    placeholder="Subtítulo (ex: 30% OFF)"
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="flex items-center justify-center gap-2 w-full px-3 py-4 rounded-xl text-sm cursor-pointer transition-all hover:opacity-80" style={{ backgroundColor: '#FFFFFF', border: '1px dashed rgba(0,0,0,0.15)', color: '#94A3B8' }}>
                    <Image size={18} />
                    <span>{offerForm.image ? 'Imagem selecionada' : 'Clique para selecionar imagem'}</span>
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
                  {uploading && <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Comprimindo imagem...</p>}
                  {offerForm.image && (
                    <div className="mt-2 relative inline-block">
                      <img src={offerForm.image} alt="Preview" className="h-20 rounded-lg object-cover" />
                      <button type="button" onClick={() => setOfferForm({ ...offerForm, image: '' })} className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white" style={{ lineHeight: 0 }}>
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowOfferForm(false)} className="flex-1 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#FFFFFF', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={!offerForm.image || uploading} className="flex-1 py-2 rounded-xl font-bold text-sm disabled:opacity-40" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                    {uploading ? 'Enviando...' : editingItem ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}

        <div className="grid grid-cols-2 gap-3">
          {offers.map((offer) => (
            <div key={offer.id} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
              <img src={offer.image} alt={offer.title} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate" style={{ color: '#1A2238' }}>{offer.title}</h4>
                <p className="text-xs" style={{ color: '#FFB347' }}>{offer.subtitle}</p>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => editOffer(offer)} className="p-1 rounded hover:bg-black/5"><Edit size={12} style={{ color: '#94A3B8' }} /></button>
                  <button onClick={() => handleDeleteOffer(offer.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <p className="col-span-2 text-center py-4 text-sm" style={{ color: '#94A3B8' }}>Nenhuma oferta cadastrada</p>
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
            onClick={() => { setShowCouponForm(true); setEditingItem(null); setCouponForm({ code: '', discount: '', color: '#1A2238' }); }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
          >
            <Plus size={16} /> Novo Cupom
          </button>
        </div>

        {showCouponForm && (
          <form onSubmit={handleSaveCoupon} className="mb-4 p-4 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="Código (ex: FACIIL10)"
                className="px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                required
              />
              <input
                type="text"
                value={couponForm.discount}
                onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                placeholder="Desconto (ex: 10% OFF)"
                className="px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCouponForm(false)} className="flex-1 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#FFFFFF', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }}>
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
                {editingItem ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: coupon.color, border: '1px solid rgba(0,0,0,0.04)' }}>
              <div>
                <span className="font-black text-lg" style={{ color: coupon.color === '#FFB347' ? '#1A2238' : '#FFFFFF' }}>{coupon.code}</span>
                <p className="text-xs font-bold" style={{ color: coupon.color === '#FFB347' ? '#1A2238' : '#FFFFFF' }}>{coupon.discount}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editCoupon(coupon)} className="p-1 rounded hover:bg-black/10"><Edit size={12} style={{ color: coupon.color === '#FFB347' ? '#1A2238' : '#FFFFFF' }} /></button>
                <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="col-span-2 text-center py-4 text-sm" style={{ color: '#94A3B8' }}>Nenhum cupom cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBannersPage;