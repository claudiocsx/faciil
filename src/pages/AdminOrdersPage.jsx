import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Orders from '../components/Orders';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import ReceiptModal from '../components/ReceiptModal';
import { Search, Filter, X } from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0 && !selectedOrder) {
      const found = orders.find((o) => o.id === orderId);
      if (found) {
        setSelectedOrder(found);
      }
    }
  }, [orders, searchParams]);

  const handleCloseReceipt = () => {
    setSelectedOrder(null);
    setSearchParams({});
  };

  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          (o.customerName && o.customerName.toLowerCase().includes(term)) ||
          o.id.toLowerCase().includes(term) ||
          (o.customerPhone && o.customerPhone.includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentMethod === paymentFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const wasCancelled = newStatus === 'cancelled';
      if (wasCancelled) {
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (orderSnap.exists()) {
          const items = orderSnap.data().items || [];
          const stockRestores = items.map((item) =>
            updateDoc(doc(db, 'products', item.id), { stock: increment(item.quantity) })
          );
          await Promise.all(stockRestores);
        }
      }
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  const hasFilters = searchTerm || statusFilter !== 'all' || paymentFilter !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Pedidos</h2>
          <p className="text-sm text-text-dim mt-1">
            {filteredOrders.length} de {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
          style={{
            backgroundColor: showFilters ? '#FFB347' : 'rgba(255,255,255,0.05)',
            color: showFilters ? '#1A2238' : '#94A3B8',
          }}
        >
          <Filter size={14} /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="glass-card p-4 rounded-xl space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              placeholder="Buscar por cliente ou pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-text-primary outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <option value="all">Todos Status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Preparando</option>
              <option value="shipping">Saiu p/ Entrega</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-text-primary outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <option value="all">Todas Formas</option>
              <option value="pix">Pix</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#EF4444' }}
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>
        </div>
      )}

      <Orders
        orders={filteredOrders}
        onUpdateStatus={handleUpdateStatus}
        onViewReceipt={setSelectedOrder}
      />
      {selectedOrder && <ReceiptModal order={selectedOrder} onClose={handleCloseReceipt} />}
    </div>
  );
};

export default AdminOrdersPage;
