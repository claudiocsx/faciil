import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Minus, Plus, Trash2, MapPin, Store, Percent, MessageCircle, Star, CheckCircle, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useProducts } from '../contexts/ProductContext';
import { db } from '../firebase';
import { collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import Toast from '../components/Toast';

const DELIVERY_FEE = 5.00;

const formatCurrency = (value) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { customer, customerLogout } = useCustomerAuth();
  const { products } = useProducts();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappLoaded, setWhatsappLoaded] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? (appliedCoupon?.type === 'freight' ? 0 : DELIVERY_FEE) : 0;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'freight' ? 0
      : appliedCoupon.type === 'percent'
        ? subtotal * (appliedCoupon.value / 100)
        : appliedCoupon.value
    : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const suggestions = useMemo(() => {
    if (cart.length === 0) return [];
    const cartIds = new Set(cart.map(i => i.id));
    const cartCats = [...new Set(cart.map(i => i.category).filter(Boolean))];
    const byCategory = cartCats.length > 0
      ? products.filter(p => cartCats.includes(p.category) && !cartIds.has(p.id))
      : [];
    if (byCategory.length > 0) return byCategory.slice(0, 4);
    return products.filter(p => !cartIds.has(p.id)).slice(0, 4);
  }, [products, cart]);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'whatsapp'));
        if (snap.exists()) setWhatsappNumber(snap.data().number);
      } catch (err) {
        console.error('Erro ao carregar WhatsApp:', err);
      }
      setWhatsappLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || '');
      setCustomerPhone(customer.phone || '');
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRemoveClick = (itemId) => setItemToRemove(itemId);

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setCouponError('Cupom inválido');
      } else {
        const data = snap.docs[0].data();
        if (data.active === false) {
          setCouponError('Cupom expirado');
        } else {
          setAppliedCoupon({ id: snap.docs[0].id, ...data });
        }
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom');
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSaveOrder = async (orderData) => {
    try {
      await addDoc(collection(db, 'orders'), { ...orderData, status: 'pending' });
      await addDoc(collection(db, 'notifications'), {
        title: 'Novo Pedido',
        message: `${orderData.customerName} fez um pedido de R$ ${orderData.total.toFixed(2)}`,
        read: false,
        createdAt: new Date().toISOString()
      });
      const stockUpdates = orderData.items.map((item) =>
        updateDoc(doc(db, 'products', item.id), { stock: increment(-item.quantity) })
      );
      await Promise.all(stockUpdates);
      clearCart();
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!validateForm()) return;

    const orderData = {
      customerName,
      customerPhone,
      customerId: customer?.id || null,
      deliveryMethod,
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon?.code || null,
      total,
      date: new Date().toISOString()
    };

    handleSaveOrder(orderData);

    let message = `*NOVO PEDIDO - FACIIL*\n`;
    message += `═══════════════════════\n\n`;
    message += `*ITENS*\n`;
    cart.forEach((item) => {
      message += `• ${item.name}\n  Qtd: ${item.quantity} x R$ ${item.price.toFixed(2).replace('.', ',')} = *R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}*\n\n`;
    });
    message += `*RESUMO*\n`;
    message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (deliveryMethod === 'delivery') {
      message += appliedCoupon?.type === 'freight'
        ? `Entrega: *FRETE GRATIS*\n`
        : `Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
    }
    if (discount > 0) {
      message += `Cupom (${appliedCoupon.code}): -R$ ${discount.toFixed(2).replace('.', ',')}\n`;
    }
    message += `*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    message += `ou 3x de R$ ${(total / 3).toFixed(2).replace('.', ',')}\n\n`;
    message += `*CLIENTE*\n`;
    message += `Nome: ${customerName}\n`;
    if (customerPhone) message += `WhatsApp: ${customerPhone}\n`;
    if (deliveryMethod === 'delivery') {
      message += `_Aguardando confirmacao do envio via Uber Flash_`;
    } else {
      message += `\n_Retirada no local_`;
    }

    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setOrderSuccess(true);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ebebeb' }}>
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(255,179,71,0.1)' }}>
            <CheckCircle size={40} style={{ color: '#FFB347' }} />
          </div>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#1A2238' }}>Pedido Enviado!</h2>
          <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>Seu pedido foi enviado via WhatsApp.</p>
          <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>Em breve retornaremos o contato.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebebeb' }}>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-70"
          style={{ color: '#FFB347' }}
        >
          <ArrowLeft size={16} /> Voltar para continuar comprando
        </button>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F8FAFC' }}>
              <ShoppingBag size={32} style={{ color: '#CBD5E1' }} />
            </div>
            <h3 className="text-lg font-black mb-2" style={{ color: '#1A2238' }}>Carrinho vazio</h3>
            <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Adicione produtos para começar</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 font-bold text-sm rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
            >
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Product Cards */}
              {cart.map((item) => {
                const img = item.image || item.images?.[0];
                const discountPct = item.originalPrice && item.originalPrice > item.price
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;
                return (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                        {img && !img.startsWith('blob:') ? (
                          <img src={img} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} style={{ color: '#CBD5E1' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-sm font-medium leading-snug line-clamp-2" style={{ color: '#1A2238' }}>{item.name}</h3>
                          <button
                            onClick={() => handleRemoveClick(item.id)}
                            className="p-1 rounded-lg transition-colors hover:bg-red-50 flex-shrink-0"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                              className="p-1 rounded transition-colors hover:bg-black/5"
                              style={{ color: '#94A3B8' }}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold" style={{ color: '#1A2238' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 rounded transition-colors disabled:opacity-30 hover:bg-black/5"
                              style={{ color: '#94A3B8' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm font-extrabold" style={{ color: '#1A2238' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                              {discountPct > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669' }}>
                                  -{discountPct}%
                                </span>
                              )}
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <p className="text-[11px] line-through" style={{ color: '#94A3B8' }}>
                                {formatCurrency(item.originalPrice * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Customer Form */}
              <div id="customer-form" className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold" style={{ color: '#1A2238' }}>Informações do Cliente</h3>
                <div className="sm:grid sm:grid-cols-2 sm:gap-4 space-y-4 sm:space-y-0">
                  <div className="space-y-1">
                    <label className="text-xs font-bold" style={{ color: '#64748B' }}>Nome</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => { setCustomerName(e.target.value); if (errors.customerName) setErrors(prev => ({ ...prev, customerName: null })); }}
                      className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#F8FAFC', border: `1px solid ${errors.customerName ? '#EF4444' : 'rgba(0,0,0,0.04)'}`, color: '#1A2238' }}
                      placeholder="Digite seu nome"
                    />
                    {errors.customerName && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.customerName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold" style={{ color: '#64748B' }}>Telefone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                      placeholder="(88) 99999-9999"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className="flex-1 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    style={deliveryMethod === 'delivery'
                      ? { backgroundColor: '#FFB347', color: '#1A2238' }
                      : { backgroundColor: '#F8FAFC', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }
                    }
                  >
                    <MapPin size={16} /> Uber Flash
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className="flex-1 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    style={deliveryMethod === 'pickup'
                      ? { backgroundColor: '#FFB347', color: '#1A2238' }
                      : { backgroundColor: '#F8FAFC', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }
                    }
                  >
                    <Store size={16} /> Retirada
                  </button>
                </div>
              </div>

              {/* Cross-selling */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={13} fill="#FFB347" style={{ color: '#FFB347' }} />
                    <span className="text-sm font-bold" style={{ color: '#1A2238' }}>Aproveite também</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                    {suggestions.map(p => {
                      const img = p.image || p.images?.[0];
                      return (
                        <div key={p.id} className="flex-shrink-0 snap-start w-[130px] rounded-xl overflow-hidden" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                          <div className="w-full h-16 overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                            {img && !img.startsWith('blob:') ? (
                              <img src={img} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} style={{ color: '#CBD5E1' }} />
                              </div>
                            )}
                          </div>
                          <div className="p-2 space-y-1">
                            <p className="text-[10px] font-medium leading-tight line-clamp-2" style={{ color: '#1A2238' }}>{p.name}</p>
                            <p className="text-[10px] font-extrabold" style={{ color: '#FFB347' }}>{formatCurrency(p.price)}</p>
                            <button
                              onClick={() => { addToCart(p); setToastMessage('Produto adicionado!'); setToastVisible(true); setTimeout(() => setToastVisible(false), 2000); }}
                              className="w-full py-1 rounded-md text-[9px] font-bold"
                              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Resumo */}
            <div className="lg:sticky lg:top-24 mt-6 lg:mt-0 space-y-4">
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold pb-3" style={{ color: '#1A2238', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>Resumo da compra</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between" style={{ color: '#64748B' }}>
                    <span>Produtos ({totalItems})</span>
                    <span className="font-medium" style={{ color: '#1A2238' }}>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between" style={{ color: '#64748B' }}>
                    <span>Envio</span>
                    {deliveryMethod === 'delivery' ? (
                      appliedCoupon?.type === 'freight' ? (
                        <span className="font-bold" style={{ color: '#10B981' }}>GRÁTIS</span>
                      ) : (
                        <span className="font-bold" style={{ color: '#FFB347' }}>{formatCurrency(DELIVERY_FEE)}</span>
                      )
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between" style={{ color: '#10B981' }}>
                      <span>Desconto ({appliedCoupon.code})</span>
                      <span className="font-bold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                {/* Coupon */}
                <div className="pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Percent size={14} style={{ color: '#FFB347' }} />
                    <span className="text-xs font-bold" style={{ color: '#1A2238' }}>Cupom de desconto</span>
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #FFB347' }}>
                      <div>
                        <span className="text-sm font-bold" style={{ color: '#1A2238' }}>{appliedCoupon.code}</span>
                        <p className="text-xs" style={{ color: '#10B981' }}>-{formatCurrency(discount)}</p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs font-bold" style={{ color: '#EF4444' }}>Remover</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                        placeholder="Ex: FACIIL10"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:brightness-110"
                        style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{couponError}</p>}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <span className="text-base font-bold" style={{ color: '#1A2238' }}>Total</span>
                  <span className="text-xl font-black" style={{ color: '#1A2238' }}>{formatCurrency(total)}</span>
                </div>
                <p className="text-xs text-center" style={{ color: '#94A3B8' }}>ou 3x de {formatCurrency(total / 3)} sem juros</p>

                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={!whatsappLoaded}
                  className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
                >
                  <MessageCircle size={18} />
                  {deliveryMethod === 'delivery' ? 'Pedir com Entrega' : 'Pedir para Retirada'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {itemToRemove && (
        <>
          <div className="fixed inset-0 bg-black/80 z-[60]" onClick={() => setItemToRemove(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-xs p-6 rounded-xl text-center space-y-4 bg-white">
            <Trash2 size={40} className="mx-auto" style={{ color: '#EF4444' }} />
            <h3 className="text-lg font-black" style={{ color: '#1A2238' }}>Remover Item?</h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>Tem certeza que deseja remover este item?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToRemove(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#F8FAFC', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                style={{ backgroundColor: '#EF4444' }}
              >
                Remover
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
