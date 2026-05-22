import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppFloat = ({ number }) => {
  const [open, setOpen] = useState(false);

  if (!number) return null;

  const clean = number.replace(/\D/g, '');

  const handleOpen = (msg) => {
    const url = 'https://wa.me/' + clean + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className="rounded-2xl shadow-xl p-3 w-64 animate-fade-in"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: '#1A2238' }}>Fale conosco</p>
          <button
            onClick={() => handleOpen('Ola! Vi o anuncio e quero saber mais')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#F0FDF4', color: '#166534' }}
          >
            {String.fromCharCode(128172)} Quero saber mais
          </button>
          <button
            onClick={() => handleOpen('Ola! Gostaria de fazer um pedido')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium mt-1 transition-all hover:opacity-80"
            style={{ backgroundColor: '#F0FDF4', color: '#166534' }}
          >
            {String.fromCharCode(127978)} Fazer um pedido
          </button>
          <button
            onClick={() => handleOpen('Ola! Preciso de ajuda com')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium mt-1 transition-all hover:opacity-80"
            style={{ backgroundColor: '#F0FDF4', color: '#166534' }}
          >
            {String.fromCharCode(10067)} Ajuda
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
        aria-label="WhatsApp"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} fill="white" />}
      </button>
    </div>
  );
};

export default WhatsAppFloat;
