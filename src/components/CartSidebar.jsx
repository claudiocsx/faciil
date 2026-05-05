import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, MapPin, Store, Tag, Check, CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const DELIVERY_FEE = 5.00; // Taxa fixa de entrega

const CartSidebar = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, whatsappNumber, onSaveOrder }) => {
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [customerName, setCustomerName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [showForm, setShowForm] = useState(false);
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

  const handleRemoveClick = (itemId) => {
    setItemToRemove(itemId);
  };

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

    let message = `🛒 *Novo Pedido - Faciil*\n\n`;
    cart.forEach((item) => {
      message += `▪️ ${item.name}\n   Qtd: ${item.quantity} | R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    message += `📦 *Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    
    if (deliveryMethod === 'delivery') {
      message += `🛵 *Entrega:* R$ ${deliveryFee.toFixed(2)}\n`;
    }
    
    if (discount > 0) {
      message += `🎟 *Cupom (${appliedCoupon.code}):* -R$ ${discount.toFixed(2)}\n`;
    }
    
    message += `\n💰 *Total: R$ ${total.toFixed(2)}*\n`;
    message += `💳 ou 3x de R$ ${(total / 3).toFixed(2)}\n\n`;

    message += `👤 *Cliente:* ${customerName}\n`;

    if (deliveryMethod === 'delivery') {
      message += `📍 *Bairro:* ${neighborhood}\n`;
      message += `🏠 *Endereço:* ${address}, ${addressNumber}\n\n`;
      message += `Aguardo confirmação do envio via Uber Flash!`;
    } else {
      message += `\nVou retirar no local!`;
    }

    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    setOrderSuccess(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setAppliedCoupon(null);
      setCouponCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (orderSuccess) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => { setOrderSuccess(false); onClose(); }}
        />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-deep border-l border-border-glow shadow-2xl z-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0,230,118,0.1)' }}>
            <CheckCircle size={40} style={{ color: '#00E676' }} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Pedido Enviado!</h2>
          <p className="text-text-dim mb-2">Seu pedido foi enviado via WhatsApp.</p>
          <p className="text-sm text-text-dim mb-8">Em breve retornaremos o contato confirmando o pedido.</p>
          <button
            onClick={() => { setOrderSuccess(false); onClose(); }}
            className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all"
            style={{ backgroundColor: '#00E676', boxShadow: '0 0 12px rgba(0,230,118,0.5)' }}
          >
            Continuar Comprando
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-deep border-l border-border-glow shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,230,118,0.1)' }}>
              <ShoppingBag size={18} style={{ color: '#00E676' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Carrinho</h2>
              <p className="text-xs text-text-dim">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-secondary">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(0,212,255,0.05)' }}>
                <ShoppingBag size={28} className="text-text-dim" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Carrinho vazio</h3>
              <p className="text-sm text-text-dim">Adicione produtos para começar</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 font-semibold text-sm rounded-xl text-black transition-all"
                style={{ backgroundColor: '#00D4FF', boxShadow: '0 0 10px rgba(0,212,255,0.4)' }}
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 glass-card p-3 rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-text-primary truncate">{item.name}</h4>
                    <p className="text-sm font-bold mt-1" style={{ color: '#C6FF00' }}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-text-primary">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveClick(item.id)}
                    className="self-start p-1.5 text-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div className="p-3 glass-card rounded-xl space-y-3">
                <p className="text-sm font-bold text-text-primary">Como deseja receber?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setDeliveryMethod('delivery'); setShowForm(true); }}
                    className="p-2.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
                    style={deliveryMethod === 'delivery'
                      ? { backgroundColor: 'rgba(0,212,255,0.15)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }
                      : { backgroundColor: 'rgba(255,255,255,0.03)', color: '#999', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    <MapPin size={18} />
                    Uber Flash
                  </button>
                  <button
                    onClick={() => { setDeliveryMethod('pickup'); setShowForm(true); }}
                    className="p-2.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
                    style={deliveryMethod === 'pickup'
                      ? { backgroundColor: 'rgba(0,230,118,0.15)', color: '#00E676', border: '1px solid rgba(0,230,118,0.3)' }
                      : { backgroundColor: 'rgba(255,255,255,0.03)', color: '#999', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    <Store size={18} />
                    Retirada
                  </button>
                </div>
                {deliveryMethod === 'delivery' && (
                  <p className="text-xs text-text-dim text-center">Taxa fixa de entrega: <span className="font-bold" style={{ color: '#C6FF00' }}>R$ {DELIVERY_FEE.toFixed(2)}</span></p>
                )}
              </div>

              {showForm && (
                <div className="p-3 glass-card rounded-xl space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-dim">Seu Nome</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => { setCustomerName(e.target.value); if (errors.customerName) setErrors(prev => ({ ...prev, customerName: null })); }}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none transition-all`}
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.customerName ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
                      placeholder="Digite seu nome"
                    />
                    {errors.customerName && <p className="text-xs text-red-400">{errors.customerName}</p>}
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-dim">Bairro</label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => { setNeighborhood(e.target.value); if (errors.neighborhood) setErrors(prev => ({ ...prev, neighborhood: null })); }}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none transition-all`}
                          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.neighborhood ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
                          placeholder="Seu bairro"
                        />
                        {errors.neighborhood && <p className="text-xs text-red-400">{errors.neighborhood}</p>}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-semibold text-text-dim">Endereço</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(prev => ({ ...prev, address: null })); }}
                            className={`w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none transition-all`}
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.address ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
                            placeholder="Rua, Avenida..."
                          />
                          {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
                        </div>
                        <div className="w-20 space-y-1.5">
                          <label className="text-xs font-semibold text-text-dim">Número</label>
                          <input
                            type="text"
                            value={addressNumber}
                            onChange={(e) => { setAddressNumber(e.target.value); if (errors.addressNumber) setErrors(prev => ({ ...prev, addressNumber: null })); }}
                            className={`w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none transition-all`}
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${errors.addressNumber ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
                            placeholder="Nº"
                          />
                          {errors.addressNumber && <p className="text-xs text-red-400">{errors.addressNumber}</p>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-3 glass-card rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} style={{ color: '#00D4FF' }} />
                  <span className="text-sm font-bold text-text-primary">Cupom de Desconto</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)' }}>
                    <span className="text-xs font-bold" style={{ color: '#00E676' }}>
                      {appliedCoupon.code} (-R$ {discount.toFixed(2)})
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-xs text-red-400 font-bold hover:underline">Remover</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder="Ex: FACIIL10"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-black transition-all"
                      style={{ backgroundColor: '#00D4FF' }}
                    >
                      {couponLoading ? '...' : <Check size={16} />}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border-subtle p-4 space-y-3 bg-bg-elevated">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-text-dim">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-text-dim">Entrega (Uber Flash)</span>
                  <span className="font-bold" style={{ color: '#C6FF00' }}>R$ {DELIVERY_FEE.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between" style={{ color: '#00E676' }}>
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span className="font-bold">-R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border-subtle">
                <span>Total</span>
                <span style={{ color: '#C6FF00' }}>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full py-3 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
              style={{ backgroundColor: '#00E676', boxShadow: '0 0 12px rgba(0,230,118,0.5), 0 0 24px rgba(0,230,118,0.2)' }}
            >
              <MessageCircle size={18} />
              {deliveryMethod === 'delivery' ? 'Pedir com Entrega' : 'Pedir para Retirada'}
            </button>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Remoção */}
      {itemToRemove && (
        <>
          <div className="fixed inset-0 bg-black/80 z-[60]" onClick={() => setItemToRemove(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-xs p-6 rounded-2xl text-center space-y-4" style={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}>
            <Trash2 size={40} className="mx-auto text-red-400" />
            <h3 className="text-lg font-bold text-text-primary">Remover Item?</h3>
            <p className="text-sm text-text-dim">Tem certeza que deseja remover este item do carrinho?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToRemove(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#B0B0B0', border: '1px solid #333333' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: '#FF6B6B' }}
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