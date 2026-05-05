import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useProducts } from '../contexts/ProductContext';
import { Search, Plus, Trash2, Check, User, CreditCard, Banknote, Wallet, MessageCircle } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

const AdminPosPage = () => {
  const { products } = useProducts();
  const [clients, setClients] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [clientSearch, setClientSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(prev => prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
    } else {
      setCart(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 && newQty <= item.stock ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Assuming no delivery fee for manual sales or can be added later

  const handleFinalize = async () => {
    if (cart.length === 0 || !selectedClient) {
      alert('Selecione o cliente e adicione produtos.');
      return;
    }
    setProcessing(true);
    try {
      const newOrder = {
        items: cart,
        customerName: selectedClient.name,
        customerId: selectedClient.id,
        customerPhone: selectedClient.phone,
        deliveryMethod,
        paymentMethod,
        subtotal,
        total,
        status: 'delivered',
        type: 'manual',
        date: new Date().toISOString()
      };

      const batch = cart.map(item => updateDoc(doc(db, 'products', item.id), { stock: increment(-item.quantity) }));
      await Promise.all(batch);

      const docRef = await addDoc(collection(db, 'orders'), newOrder);

      // Show receipt modal
      setLastOrder({ ...newOrder, id: docRef.id });

      // WhatsApp logic (optional, handled in modal but user might want immediate)
      // For now, we let the modal handle it or we can trigger it if checked.
      // To keep it simple, I'll rely on the modal for the action, but if they checked "Send WhatsApp", 
      // I can trigger the modal which has the button.
      
      setCart([]);
      setSelectedClient(null);
      setClientSearch('');
      alert('Venda registrada com sucesso!');
    } catch (err) {
      alert(err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Products List */}
      <div className="flex-1 flex flex-col glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-subtle">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text" placeholder="Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
          {filteredProducts.map(p => (
            <button
              key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
              className="glass-card p-3 rounded-lg text-left hover:bg-white/5 transition-all disabled:opacity-30 active:scale-95"
            >
              <div className="w-full h-24 bg-bg-elevated rounded-md overflow-hidden mb-2">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-text-primary truncate">{p.name}</p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--color-neon-lime)' }}>R$ {p.price.toFixed(2)}</p>
              <p className="text-xs text-text-dim">Estoque: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-full lg:w-96 flex flex-col glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-subtle">
          <h3 className="font-bold text-text-primary">Nova Venda</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-dim flex items-center gap-1"><User size={12} /> Cliente</label>
            {!selectedClient ? (
              <>
                <input
                  type="text" placeholder="Buscar cliente..." value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredClients.map(c => (
                    <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(''); }} className="w-full p-2 rounded text-xs text-left hover:bg-white/5 transition-colors text-text-primary">
                      {c.name} - {c.phone}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-2 rounded-lg text-sm bg-white/5 flex items-center justify-between">
                <span>{selectedClient.name}</span>
                <button onClick={() => setSelectedClient(null)} className="text-red-400"><Trash2 size={14} /></button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-neon-green">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white/10 rounded text-text-secondary"><Trash2 size={12} /></button>
                  <span className="text-sm font-bold w-4 text-center text-text-primary">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white/10 rounded text-text-secondary"><Plus size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Delivery */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'pix', icon: Wallet, label: 'Pix' }, { id: 'cash', icon: Banknote, label: 'Dinheiro' }, { id: 'card', icon: CreditCard, label: 'Cartão' }].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition-all ${paymentMethod === m.id ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-white/5 text-text-dim'}`}>
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle space-y-3 bg-bg-elevated">
          <div className="flex justify-between text-lg font-bold text-text-primary">
            <span>Total</span>
            <span style={{ color: 'var(--color-neon-lime)' }}>R$ {total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleFinalize} disabled={processing || cart.length === 0 || !selectedClient}
            className="w-full py-3 text-black rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-neon-green)', boxShadow: '0 0 10px rgba(0,230,118,0.4)' }}
          >
            <Check size={18} /> Finalizar Venda
          </button>
          {selectedClient && (
            <label className="flex items-center gap-2 justify-center cursor-pointer select-none">
              <input type="checkbox" checked={sendWhatsapp} onChange={(e) => setSendWhatsapp(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#00D4FF' }} />
              <span className="text-xs text-text-secondary">Enviar recibo via WhatsApp</span>
            </label>
          )}
        </div>
      </div>
      {lastOrder && <ReceiptModal order={lastOrder} onClose={() => setLastOrder(null)} />}
    </div>
  );
};

export default AdminPosPage;
