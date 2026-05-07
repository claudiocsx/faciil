import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, MapPin, Store, Tag, Check, CheckCircle, Upload } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const DELIVERY_FEE = 5.00;

const CartSidebar = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, whatsappNumber, onSaveOrder }) => {
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [customerName, setCustomerName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [errors, setErrors] = useState({});
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  
  const discount = appliedCoupon 
    ? appliedCoupon.type === 'percent' 
      ? subtotal * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const total = subtotal + deliveryFee - discount;

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = 'Nome é obrigatório';
    if (deliveryMethod === 'delivery') {
      if (!neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!address.trim()) newErrors.address = 'Endereço é obrigatório';
      if (!addressNumber.trim()) newErrors.addressNumber = 'Número é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRemoveClick = (itemId) => setItemToRemove(itemId);

  const confirmRemove = () => {
    if (itemToRemove) {
      onRemoveItem(itemToRemove);
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
          setCouponError('');
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

  const handleWhatsAppCheckout = () => {
    if (!validateForm()) return;

    const orderData = {
      customerName,
      customerPhone: '',
      deliveryMethod,
      neighborhood: deliveryMethod === 'delivery' ? neighborhood : '',
      address: deliveryMethod === 'delivery' ? address : '',
      addressNumber: deliveryMethod === 'delivery' ? addressNumber : '',
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon?.code || null,
      total,
      date: new Date().toISOString()
    };

    if (onSaveOrder) onSaveOrder(orderData);

    let message = `🛒 *NOVO PEDIDO - FACIIL*\n`;
    message += `─────────────────────\n\n`;
    message += `*ITENS*\n`;
    cart.forEach((item) => {
      message += `▪️ ${item.name}\n   Qtd: ${item.quantity} × R$ ${item.price.toFixed(2).replace('.', ',')} = *R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}*\n\n`;
    });
    message += `*RESUMO*\n`;
    message += `📦 Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    
    if (deliveryMethod === 'delivery') {
      message += `🛵 Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
    }
    
    if (discount > 0) {
      message += `🎟 Cupom (${appliedCoupon.code}): -R$ ${discount.toFixed(2).replace('.', ',')}\n`;
    }
    
    message += `💰 *Total: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    message += `💳 ou 3× R$ ${(total / 3).toFixed(2).replace('.', ',')}\n\n`;

    message += `*CLIENTE*\n`;
    message += `👤 ${customerName}\n`;

    if (deliveryMethod === 'delivery') {
      message += `📍 ${neighborhood}\n`;
      message += `🏠 ${address}, ${addressNumber}\n\n`;
      message += `_Aguardando confirmação do envio via Uber Flash_`;
    } else {
      message += `\n🏪 _Retirada no local_`;
    }

    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    setOrderSuccess(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setAppliedCoupon(null);
      setCouponCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (orderSuccess) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => { setOrderSuccess(false); onClose(); }} />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col items-center justify-center p-8 text-center" style={{ borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,179,71,0.1)' }}>
            <CheckCircle size={40} style={{ color: '#FFB347' }} />
          </div>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#1A2238' }}>Pedido Enviado!</h2>
          <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>Seu pedido foi enviado via WhatsApp.</p>
          <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>Em breve retornaremos o contato.</p>
          <button
            onClick={() => { setOrderSuccess(false); onClose(); }}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
          >
            Continuar Comprando
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col" style={{ borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFB347' }}>
              <ShoppingBag size={20} style={{ color: '#1A2238' }} />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: '#1A2238' }}>Carrinho</h2>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-black/5" style={{ color: '#1A2238' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F8FAFC' }}>
                <ShoppingBag size={32} style={{ color: '#CBD5E1' }} />
              </div>
              <h3 className="text-base font-black mb-2" style={{ color: '#1A2238' }}>Carrinho vazio</h3>
              <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>Adicione produtos para começar</p>
              <button
                onClick={onClose}
                className="px-6 py-3 font-bold text-sm rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F1F5F9' }}>
                    {(() => {
                      const img = item.image || item.images?.[0];
                      return img && !img.startsWith('blob:') ? (
                        <img src={img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload size={20} className="text-gray-300" />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm line-clamp-2" style={{ color: '#1A2238' }}>{item.name}</h4>
                    <p className="text-sm font-extrabold mt-1" style={{ color: '#1A2238' }}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.stock)}
                          className="p-1 rounded transition-colors hover:bg-black/5"
                          style={{ color: '#94A3B8' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold" style={{ color: '#1A2238' }}>{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.stock)}
                          disabled={item.quantity >= item.stock}
                          className="p-1 rounded transition-colors disabled:opacity-30 hover:bg-black/5"
                          style={{ color: '#94A3B8' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveClick(item.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                <p className="text-sm font-bold" style={{ color: '#1A2238' }}>Como deseja receber?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className="p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all"
                    style={deliveryMethod === 'delivery'
                      ? { backgroundColor: '#FFB347', color: '#1A2238' }
                      : { backgroundColor: '#FFFFFF', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }
                    }
                  >
                    <MapPin size={20} />
                    Uber Flash
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className="p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all"
                    style={deliveryMethod === 'pickup'
                      ? { backgroundColor: '#FFB347', color: '#1A2238' }
                      : { backgroundColor: '#FFFFFF', color: '#94A3B8', border: '1px solid rgba(0,0,0,0.04)' }
                    }
                  >
                    <Store size={20} />
                    Retirada
                  </button>
                </div>
                {deliveryMethod === 'delivery' && (
                  <p className="text-xs text-center" style={{ color: '#94A3B8' }}>Taxa fixa: <span className="font-bold" style={{ color: '#FFB347' }}>R$ {DELIVERY_FEE.toFixed(2)}</span></p>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold" style={{ color: '#1A2238' }}>Seu Nome</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => { setCustomerName(e.target.value); if (errors.customerName) setErrors(prev => ({ ...prev, customerName: null })); }}
                      className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${errors.customerName ? '#EF4444' : 'rgba(0,0,0,0.04)'}`, color: '#1A2238' }}
                      placeholder="Digite seu nome"
                    />
                    {errors.customerName && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.customerName}</p>}
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold" style={{ color: '#1A2238' }}>Bairro</label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => { setNeighborhood(e.target.value); if (errors.neighborhood) setErrors(prev => ({ ...prev, neighborhood: null })); }}
                          className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                          style={{ backgroundColor: '#FFFFFF', border: `1px solid ${errors.neighborhood ? '#EF4444' : 'rgba(0,0,0,0.04)'}`, color: '#1A2238' }}
                          placeholder="Seu bairro"
                        />
                        {errors.neighborhood && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.neighborhood}</p>}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold" style={{ color: '#1A2238' }}>Endereço</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(prev => ({ ...prev, address: null })); }}
                            className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: '#FFFFFF', border: `1px solid ${errors.address ? '#EF4444' : 'rgba(0,0,0,0.04)'}`, color: '#1A2238' }}
                            placeholder="Rua, Avenida..."
                          />
                          {errors.address && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.address}</p>}
                        </div>
                        <div className="w-20 space-y-2">
                          <label className="text-xs font-bold" style={{ color: '#1A2238' }}>Nº</label>
                          <input
                            type="text"
                            value={addressNumber}
                            onChange={(e) => { setAddressNumber(e.target.value); if (errors.addressNumber) setErrors(prev => ({ ...prev, addressNumber: null })); }}
                            className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: '#FFFFFF', border: `1px solid ${errors.addressNumber ? '#EF4444' : 'rgba(0,0,0,0.04)'}`, color: '#1A2238' }}
                            placeholder="Nº"
                          />
                          {errors.addressNumber && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.addressNumber}</p>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2">
                  <Tag size={16} style={{ color: '#FFB347' }} />
                  <span className="text-sm font-bold" style={{ color: '#1A2238' }}>Cupom de Desconto</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #FFB347' }}>
                    <span className="text-sm font-bold" style={{ color: '#1A2238' }}>
                      {appliedCoupon.code} (-R$ {discount.toFixed(2)})
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-xs font-bold" style={{ color: '#EF4444' }}>Remover</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                      placeholder="Ex: FACIIL10"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs" style={{ color: '#EF4444' }}>{couponError}</p>}
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 space-y-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', backgroundColor: '#F8FAFC' }}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: '#94A3B8' }}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span style={{ color: '#94A3B8' }}>Entrega (Uber Flash)</span>
                  <span className="font-bold" style={{ color: '#FFB347' }}>R$ {DELIVERY_FEE.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between" style={{ color: '#10B981' }}>
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span className="font-bold">-R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}>
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-center" style={{ color: '#94A3B8' }}>ou 3x de R$ {(total / 3).toFixed(2)} sem juros</p>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#FFB347', color: '#1A2238', boxShadow: '0 4px 12px rgba(255,179,71,0.3)' }}
            >
              <MessageCircle size={18} />
              {deliveryMethod === 'delivery' ? 'Pedir com Entrega' : 'Pedir para Retirada'}
            </button>
          </div>
        )}
      </div>

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
    </>
  );
};

export default CartSidebar;