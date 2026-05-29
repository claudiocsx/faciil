import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  increment,
  setDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useProducts } from '../contexts/ProductContext';
import {
  Search,
  Plus,
  Trash2,
  Check,
  User,
  CreditCard,
  Banknote,
  Wallet,
  MessageCircle,
  Upload,
  X,
  Percent,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import { useAlert } from '../contexts/AlertContext';

const AdminPosPage = () => {
  const { products } = useProducts();
  const { showAlert } = useAlert();
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [noClient, setNoClient] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [clientSearch, setClientSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' });
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [viewMode, setViewMode] = useState('sale');

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'customers'), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const unsubOrders = onSnapshot(
      query(
        collection(db, 'orders'),
        where('date', '>=', today.toISOString()),
        where('date', '<', tomorrow.toISOString()),
        orderBy('date', 'desc')
      ),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubClients();
      unsubOrders();
    };
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone?.includes(clientSearch) ||
      c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart((prev) =>
          prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      }
    } else {
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 && newQty <= item.stock ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = discountValue
    ? discountType === 'percent'
      ? subtotal * (Number(discountValue) / 100)
      : Number(discountValue)
    : 0;
  const total = Math.max(0, subtotal - discount);

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.phone) {
      showAlert('Preenha nome e telefone');
      return;
    }
    try {
      const docRef = doc(collection(db, 'customers'));
      await setDoc(docRef, {
        ...newClient,
        createdAt: new Date().toISOString(),
      });
      setSelectedClient({ id: docRef.id, ...newClient });
      setNoClient(false);
      setShowNewClient(false);
      setNewClient({ name: '', phone: '', email: '' });
    } catch (err) {
      showAlert('Erro ao criar cliente: ' + err.message);
    }
  };

  const handleFinalize = async () => {
    if (cart.length === 0) {
      showAlert('Adicione produtos ao carrinho.');
      return;
    }
    setProcessing(true);
    try {
      const customerName = noClient ? 'Consumidor' : selectedClient?.name || 'Consumidor';
      const customerId = noClient ? null : selectedClient?.id;
      const customerPhone = noClient ? '' : selectedClient?.phone || '';

      const newOrder = {
        items: cart,
        customerName,
        customerId,
        customerPhone,
        deliveryMethod: 'pickup',
        paymentMethod,
        subtotal,
        discount,
        discountType,
        discountValue: discountValue ? Number(discountValue) : 0,
        total,
        status: 'delivered',
        type: 'manual',
        date: new Date().toISOString(),
      };

      const batch = cart.map((item) =>
        updateDoc(doc(db, 'products', item.id), { stock: increment(-item.quantity) })
      );
      await Promise.all(batch);

      const docRef = await addDoc(collection(db, 'orders'), newOrder);

      await addDoc(collection(db, 'notifications'), {
        title: 'Venda Manual',
        message: `Venda para ${customerName} no valor de R$ ${total.toFixed(2)} (${paymentMethod})`,
        type: 'manual_sale',
        orderId: docRef.id,
        read: false,
        createdAt: new Date().toISOString(),
      });

      setLastOrder({ ...newOrder, id: docRef.id });

      setCart([]);
      setSelectedClient(null);
      setNoClient(false);
      setClientSearch('');
      setDiscountValue('');
      showAlert('Venda registrada com sucesso!');
    } catch (err) {
      showAlert(err.message);
    }
    setProcessing(false);
  };

  const totalDaySales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Products List */}
      <div className="flex-1 flex flex-col glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setViewMode('sale')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'sale' ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-white/5 text-text-dim'}`}
            >
              <ShoppingBag size={14} className="inline mr-1" /> Venda
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'orders' ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-white/5 text-text-dim'}`}
            >
              <MessageCircle size={14} className="inline mr-1" /> Hoje ({orders.length})
            </button>
          </div>
        </div>

        {viewMode === 'sale' ? (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="glass-card p-3 rounded-lg text-left hover:bg-white/5 transition-all disabled:opacity-30 active:scale-95"
              >
                <div className="w-full h-24 bg-gray-100 rounded-md overflow-hidden mb-2">
                  {(() => {
                    const img = p.image || p.images?.[0];
                    return img && !img.startsWith('blob:') ? (
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload size={24} className="text-gray-300" />
                      </div>
                    );
                  })()}
                </div>
                <p className="text-xs font-bold text-text-primary truncate">{p.name}</p>
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--color-neon-lime)' }}>
                  R$ {p.price.toFixed(2)}
                </p>
                <p className="text-xs text-text-dim">Estoque: {p.stock}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="glass-card p-4 rounded-xl mb-4">
              <div className="flex justify-between items-center">
                <span className="text-text-dim text-sm">Total de vendas hoje</span>
                <span className="text-xl font-bold text-neon-green">
                  R$ {totalDaySales.toFixed(2)}
                </span>
              </div>
            </div>
            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-card p-3 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary">{order.customerName}</p>
                  <p className="text-xs text-text-dim">
                    {new Date(order.date).toLocaleTimeString('pt-BR')} •{' '}
                    {order.paymentMethod === 'pix'
                      ? 'Pix'
                      : order.paymentMethod === 'cash'
                        ? 'Dinheiro'
                        : 'Cartão'}
                  </p>
                </div>
                <span className="text-neon-green font-bold">
                  R$ {(order.total || 0).toFixed(2)}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-text-dim py-8">Nenhuma venda hoje</p>
            )}
          </div>
        )}
      </div>

      {/* Cart & Checkout */}
      <div className="w-full lg:w-96 flex flex-col glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-subtle">
          <h3 className="font-bold text-text-primary">Nova Venda</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-dim flex items-center gap-1">
              <User size={12} /> Cliente
            </label>
            {!selectedClient && !noClient ? (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <button
                    onClick={() => setShowNewClient(!showNewClient)}
                    className="px-3 py-2 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNoClient(true);
                      setClientSearch('');
                    }}
                    className="text-xs text-text-dim hover:text-neon-cyan underline"
                  >
                    Venda sem cliente
                  </button>
                </div>
                {clientSearch && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedClient(c);
                          setNoClient(false);
                          setClientSearch('');
                        }}
                        className="w-full p-2 rounded text-xs text-left hover:bg-white/5 transition-colors text-text-primary"
                      >
                        {c.name} - {c.phone}
                      </button>
                    ))}
                  </div>
                )}

                {showNewClient && (
                  <div
                    className="p-3 rounded-lg space-y-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Nome"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className="w-full px-2 py-1.5 rounded text-xs text-text-primary outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full px-2 py-1.5 rounded text-xs text-text-primary outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Email (opcional)"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      className="w-full px-2 py-1.5 rounded text-xs text-text-primary outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowNewClient(false)}
                        className="flex-1 py-1.5 rounded text-xs text-text-dim"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateClient}
                        className="flex-1 py-1.5 rounded text-xs font-bold"
                        style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : noClient ? (
              <div className="p-2 rounded-lg text-sm bg-white/5 flex items-center justify-between">
                <span className="text-text-dim">Venda sem cliente</span>
                <button onClick={() => setNoClient(false)} className="text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="p-2 rounded-lg text-sm bg-white/5 flex items-center justify-between">
                <span>{selectedClient.name}</span>
                <button onClick={() => setSelectedClient(null)} className="text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-neon-green">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:bg-white/10 rounded text-text-secondary"
                  >
                    <Trash2 size={12} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center text-text-primary">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:bg-white/10 rounded text-text-secondary"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-center text-text-dim py-4 text-sm">Nenhum produto adicionado</p>
            )}
          </div>

          {/* Discount */}
          {cart.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <label className="text-xs font-bold text-text-dim flex items-center gap-1">
                {discountType === 'percent' ? <Percent size={12} /> : <DollarSign size={12} />}{' '}
                Desconto
              </label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="px-2 py-2 rounded-lg text-xs text-text-primary outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <option value="percent">%</option>
                  <option value="fixed">R$</option>
                </select>
                <input
                  type="number"
                  placeholder={discountType === 'percent' ? '10' : '5.00'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
              </div>
              {discount > 0 && (
                <p className="text-xs text-neon-green">Desconto: -R$ {discount.toFixed(2)}</p>
              )}
            </div>
          )}

          {/* Payment & Delivery */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pix', icon: Wallet, label: 'Pix' },
                { id: 'cash', icon: Banknote, label: 'Dinheiro' },
                { id: 'card', icon: CreditCard, label: 'Cartão' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition-all ${paymentMethod === m.id ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-white/5 text-text-dim'}`}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle space-y-3 bg-bg-elevated">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-text-dim">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-neon-green">
                <span>Desconto</span>
                <span>-R$ {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-text-primary">
              <span>Total</span>
              <span style={{ color: 'var(--color-neon-lime)' }}>R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleFinalize}
            disabled={processing || cart.length === 0}
            className="w-full py-3 text-black rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-neon-green)' }}
          >
            <Check size={18} /> Finalizar Venda
          </button>
          {selectedClient && (
            <label className="flex items-center gap-2 justify-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendWhatsapp}
                onChange={(e) => setSendWhatsapp(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#FFB347' }}
              />
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
