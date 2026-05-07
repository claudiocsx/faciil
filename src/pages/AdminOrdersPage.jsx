import { useState, useEffect } from 'react';
import Orders from '../components/Orders';
import { collection, doc, getDoc, updateDoc, increment, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ReceiptModal from '../components/ReceiptModal';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return unsubscribe;
  }, []);

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Pedidos</h2>
        <p className="text-sm text-text-dim mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
      </div>
      <Orders orders={orders} onUpdateStatus={handleUpdateStatus} onViewReceipt={setSelectedOrder} />
      {selectedOrder && <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default AdminOrdersPage;
