import React, { useState } from 'react';
import { X } from 'lucide-react';

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
            style={{ backgroundColor: 'rgba(255,179,71,0.1)', color: '#1A2238' }}
          >
            {String.fromCharCode(128172)} Quero saber mais
          </button>
          <button
            onClick={() => handleOpen('Ola! Gostaria de fazer um pedido')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium mt-1 transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,179,71,0.1)', color: '#1A2238' }}
          >
            {String.fromCharCode(127978)} Fazer um pedido
          </button>
          <button
            onClick={() => handleOpen('Ola! Preciso de ajuda com')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium mt-1 transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,179,71,0.1)', color: '#1A2238' }}
          >
            {String.fromCharCode(10067)} Ajuda
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
        aria-label="WhatsApp"
      >
        {open ? <X size={24} /> : (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#1A2238" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.032 21.965c-1.815 0-3.657-.473-5.256-1.354l-5.19 1.354 1.395-4.957C2.19 14.992 1.66 13.023 1.66 11.01c0-5.736 4.649-10.406 10.372-10.406 5.72 0 10.373 4.67 10.373 10.406 0 5.734-4.653 10.379-10.373 10.379zm0-19.282c-4.931 0-8.943 4.012-8.943 8.945 0 1.963.637 3.79 1.705 5.267l-1.117 3.975 4.117-1.074c1.444.787 3.072 1.195 4.758 1.195 4.931 0 8.942-4.012 8.942-8.945s-4.011-8.945-8.942-8.945l-.52.001v.001zm5.378 11.497c-.214.602-.88.931-1.457.998-.504.059-1.038.065-1.663-.269-2.622-1.361-3.958-3.97-4.094-4.15-.137-.18-.975-1.294-.975-2.467 0-1.173.618-1.751.833-1.99.214-.24.467-.299.623-.299.156 0 .311.003.446.012.143.009.335-.055.522.404.19.464.643 1.601.673 1.727.07.299.044.544-.182.781-.215.237-.309.355-.52.569-.156.157-.312.328-.069.676.244.349 1.083 1.785 2.326 2.783 1.594 1.281 1.902 1.436 2.161 1.424.378-.017.609-.216.772-.404.163-.188.207-.359.302-.528.095-.169.155-.225.302-.15.146.075.917.473 1.074.559.156.085.26.128.28.203.028.088-.041.527-.214 1.051l-.015.016z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default WhatsAppFloat;
