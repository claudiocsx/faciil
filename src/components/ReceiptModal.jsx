import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';

const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=600');
    const html = `
      <html>
        <head>
          <title>Recibo #${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
            .sub { text-align: center; font-size: 12px; margin-bottom: 15px; color: #555; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 16px; text-align: right; margin-top: 10px; }
            .item { margin-bottom: 4px; }
            .item-name { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>FACIIL</h1>
          <div class="sub">Tecnologia ao seu alcance</div>
          <div class="line"></div>
          <div class="row"><span>Pedido:</span> <span>#${order.id}</span></div>
          <div class="row"><span>Data:</span> <span>${new Date(order.date).toLocaleDateString('pt-BR')} ${new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div class="row"><span>Pagamento:</span> <span>${order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'cash' ? 'Dinheiro' : 'Cartão'}</span></div>
          ${order.customerName ? `<div class="row"><span>Cliente:</span> <span>${order.customerName}</span></div>` : ''}
          <div class="line"></div>
          <h3>Itens:</h3>
          ${order.items.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="row"><span>${item.quantity}x R$ ${item.price.toFixed(2)}</span> <span>R$ ${(item.quantity * item.price).toFixed(2)}</span></div>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="total">TOTAL: R$ ${(order.total || order.subtotal || 0).toFixed(2)}</div>
          <div class="line"></div>
          <div style="text-align: center; margin-top: 15px;">Obrigado pela preferência!</div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleWhatsApp = () => {
    const phone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
    const finalPhone = phone.length <= 11 ? '55' + phone : phone;

    if (!finalPhone) {
      alert('Telefone do cliente não informado neste pedido.');
      return;
    }

    let msg = `🛍️ *FACIIL - RECIBO DE COMPRA*\n`;
    msg += `------------------------------\n`;
    msg += `👤 *Cliente:* ${order.customerName || 'Cliente'}\n`;
    msg += `📅 *Data:* ${new Date(order.date).toLocaleDateString('pt-BR')} ${new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    msg += `💳 *Pagamento:* ${order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'cash' ? 'Dinheiro' : 'Cartão'}\n`;
    msg += `------------------------------\n`;
    msg += `🛒 *Itens:*\n`;
    order.items.forEach(item => {
      msg += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    msg += `------------------------------\n`;
    msg += `💰 *TOTAL: R$ ${(order.total || order.subtotal || 0).toFixed(2)}*\n`;
    msg += `------------------------------\n`;
    msg += `Obrigado pela preferência!\nFaciil - Tecnologia ao seu alcance.`;

    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full max-w-sm rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#FDFDFD', border: '1px solid rgba(59,139,185,0.2)' }}>
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h3 className="text-lg font-bold text-text-primary">Recibo #{order.id}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-text-secondary">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 font-mono text-sm text-text-primary bg-white/5 mx-4 my-4 rounded-lg border border-white/5">
          <div className="text-center">
            <p className="font-bold text-base">FACIIL</p>
            <p className="text-xs text-text-dim">Tecnologia ao seu alcance</p>
          </div>
          <div className="border-t border-dashed border-text-dim my-2" />
          <div className="space-y-1 text-xs text-text-secondary">
            <div className="flex justify-between"><span>Pedido:</span> <span>#{order.id}</span></div>
            <div className="flex justify-between"><span>Data:</span> <span>{new Date(order.date).toLocaleDateString('pt-BR')}</span></div>
            <div className="flex justify-between"><span>Pagamento:</span> <span>{order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'cash' ? 'Dinheiro' : 'Cartão'}</span></div>
            {order.customerName && <div className="flex justify-between"><span>Cliente:</span> <span className="truncate ml-2 max-w-[150px]">{order.customerName}</span></div>}
          </div>
          <div className="border-t border-dashed border-text-dim my-2" />
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-text-dim my-2" />
          <div className="flex justify-between font-bold text-base text-neon-green">
            <span>TOTAL</span>
            <span>R$ {(order.total || order.subtotal || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="p-4 bg-bg-elevated flex gap-2">
          <button onClick={handleWhatsApp} className="flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: '#1A2238', color: '#000' }}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={handlePrint} className="flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: '#FFB347', color: '#000' }}>
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
