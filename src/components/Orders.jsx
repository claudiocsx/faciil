import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, ChevronDown, ChevronUp, Copy, MessageCircle, Bike, Upload, XCircle } from 'lucide-react';
import Logo from './Logo';

const Orders = ({ orders, onUpdateStatus, onViewReceipt }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { icon: Clock, label: 'Pendente', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' };
      case 'processing': return { icon: Package, label: 'Preparando', color: '#FFB347', bg: 'rgba(59,139,185,0.1)' };
      case 'shipping': return { icon: Bike, label: 'Saiu p/ Entrega', color: '#FFB347', bg: 'rgba(138,168,46,0.1)' };
      case 'delivered': return { icon: CheckCircle, label: 'Entregue', color: '#1A2238', bg: 'rgba(90,158,90,0.1)' };
      case 'cancelled': return { icon: XCircle, label: 'Cancelado', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' };
      default: return { icon: Clock, label: status, color: '#666', bg: 'rgba(255,255,255,0.05)' };
    }
  };

  const statusFlow = ['pending', 'processing', 'shipping', 'delivered'];

  const handleCopyAddress = (order, e) => {
    e.stopPropagation();
    let text = `Endereço para Uber Flash:\n`;
    text += `${order.address}, ${order.addressNumber || order.number}`;
    if (order.complement) text += ` - ${order.complement}`;
    text += `\nBairro: ${order.neighborhood || 'Não informado'}`;
    if (order.city) text += `\nCidade: ${order.city}`;
    text += `\nCliente: ${order.customerName || order.name}`;
    text += `\nTelefone: ${order.customerPhone || 'Não informado'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNextStatus = (order, e) => {
    e.stopPropagation();
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex < statusFlow.length - 1 && onUpdateStatus) {
      onUpdateStatus(order.id, statusFlow[currentIndex + 1]);
    }
  };

  const handleCancel = (order, e) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja cancelar o pedido #${order.id}?`)) {
      onUpdateStatus(order.id, 'cancelled');
    }
  };

  const canCancel = (status) => !['delivered', 'cancelled'].includes(status);

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(59,139,185,0.05)' }}>
          <Package size={28} className="text-text-dim" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">Nenhum pedido ainda</h3>
        <p className="text-sm text-text-dim">Os pedidos aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const isExpanded = expandedOrder === order.id;
        const currentIdx = statusFlow.indexOf(order.status);
        const hasNextStatus = currentIdx < statusFlow.length - 1;

        return (
          <div key={order.id} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: statusInfo.bg }}>
                <statusInfo.icon size={18} style={{ color: statusInfo.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-text-primary">#{order.id}</span>
                  {order.type === 'manual' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">Manual</span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                  {order.deliveryMethod === 'delivery' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(59,139,185,0.1)', color: '#FFB347' }}>
                      🛵 Entrega
                    </span>
                  )}
                  {order.deliveryMethod === 'pickup' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(90,158,90,0.1)', color: '#1A2238' }}>
                      🏪 Retirada
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-dim">{order.customerName || order.name} • {new Date(order.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm" style={{ color: '#FFB347' }}>R$ {order.total?.toFixed(2)}</p>
              </div>
              {isExpanded ? <ChevronUp size={18} className="text-text-dim" /> : <ChevronDown size={18} className="text-text-dim" />}
            </button>

            {isExpanded && (
              <div className="border-t p-4 space-y-3" style={{ borderColor: 'rgba(59,139,185,0.1)' }}>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {(() => {
                          const img = item.image || item.images?.[0];
                          return img && !img.startsWith('blob:') ? (
                            <img src={img} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Upload size={14} className="text-gray-300" />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-text-primary truncate">{item.name}</p>
                        <p className="text-xs text-text-dim">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm" style={{ color: '#FFB347' }}>R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {(order.neighborhood || order.address) && order.deliveryMethod === 'delivery' && (
                  <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                        <MapPin size={14} style={{ color: '#FFB347' }} /> Endereço de Entrega
                      </div>
                      <button
                        onClick={(e) => handleCopyAddress(order, e)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all"
                        style={{ backgroundColor: 'rgba(59,139,185,0.1)', color: '#FFB347' }}
                      >
                        <Copy size={12} />
                        {copiedId === order.id ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-sm text-text-dim">{order.customerName || order.name}</p>
                    <p className="text-sm text-text-dim">
                      {order.address}, {order.addressNumber || order.number}
                      {order.complement ? ` - ${order.complement}` : ''}
                    </p>
                    <p className="text-sm text-text-dim">{order.neighborhood}</p>
                  </div>
                )}

                {order.deliveryMethod === 'pickup' && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(90,158,90,0.05)', border: '1px solid rgba(90,158,90,0.15)' }}>
                    <p className="text-sm font-bold" style={{ color: '#1A2238' }}>🏪 Cliente vai retirar no local</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {onViewReceipt && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewReceipt(order); }}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ backgroundColor: 'rgba(138,168,46,0.15)', color: '#FFB347', border: '1px solid rgba(138,168,46,0.3)' }}
                    >
                      🧾 Recibo
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={(e) => handleNextStatus(order, e)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ backgroundColor: 'rgba(59,139,185,0.15)', color: '#FFB347', border: '1px solid rgba(59,139,185,0.3)' }}
                    >
                      <Package size={14} /> Preparar Pedido
                    </button>
                  )}
                  {order.status === 'processing' && order.deliveryMethod === 'delivery' && (
                    <button
                      onClick={(e) => handleNextStatus(order, e)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ backgroundColor: 'rgba(138,168,46,0.15)', color: '#FFB347', border: '1px solid rgba(138,168,46,0.3)' }}
                    >
                      <Bike size={14} /> Saiu p/ Entrega
                    </button>
                  )}
                  {order.status === 'processing' && order.deliveryMethod === 'pickup' && (
                    <button
                      onClick={(e) => handleNextStatus(order, e)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ backgroundColor: 'rgba(90,158,90,0.15)', color: '#1A2238', border: '1px solid rgba(90,158,90,0.3)' }}
                    >
                      <CheckCircle size={14} /> Entregue
                    </button>
                  )}
                  {order.status === 'shipping' && (
                    <button
                      onClick={(e) => handleNextStatus(order, e)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ backgroundColor: 'rgba(90,158,90,0.15)', color: '#1A2238', border: '1px solid rgba(90,158,90,0.3)' }}
                    >
                      <CheckCircle size={14} /> Confirmar Entrega
                    </button>
                  )}
                  {canCancel(order.status) && (
                    <button
                      onClick={(e) => handleCancel(order, e)}
                      className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}
                    >
                      <XCircle size={14} /> Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Orders;
