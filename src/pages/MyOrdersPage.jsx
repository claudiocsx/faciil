import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { ShoppingBag, ChevronLeft, Package, Clock, MapPin, CreditCard } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Logo from '../components/Logo';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerId', '==', customer.id),
          orderBy('date', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Erro ao carregar pedidos', err);
      }
      setLoading(false);
    };
    load();
  }, [customer]);

  if (!customer) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
        style={{ backgroundColor: '#FDFDFD' }}
      >
        <Logo size={48} />
        <h2 className="text-xl font-black mt-6" style={{ color: '#1A2238' }}>
          Faça login
        </h2>
        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>
          Entre para ver seus pedidos
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-3 rounded-xl font-bold text-sm"
          style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
        >
          Ir para Loja
        </button>
      </div>
    );
  }

  if (loading) return <LoadingScreen message="Carregando pedidos..." />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFDFD' }}>
      <header
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 font-bold text-sm"
              style={{ color: '#1A2238' }}
            >
              <ChevronLeft size={20} /> Voltar
            </button>
            <h1 className="font-black text-base" style={{ color: '#1A2238' }}>
              Meus Pedidos
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#F8FAFC' }}
            >
              <Package size={32} style={{ color: '#CBD5E1' }} />
            </div>
            <h3 className="text-lg font-black" style={{ color: '#1A2238' }}>
              Nenhum pedido ainda
            </h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Seus pedidos aparecerão aqui
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl font-bold text-sm"
              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
            >
              Comprar Agora
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl space-y-3"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#94A3B8' }}
                  >
                    {new Date(order.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      order.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-600'
                        : order.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-600'
                          : order.status === 'delivered'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {order.status === 'pending'
                      ? 'Pendente'
                      : order.status === 'confirmed'
                        ? 'Confirmado'
                        : order.status === 'delivered'
                          ? 'Entregue'
                          : 'Cancelado'}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && (
                        <div
                          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: '#F8FAFC' }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#1A2238' }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>
                          Qtd: {item.quantity} x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold" style={{ color: '#1A2238' }}>
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 space-y-1" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  {order.deliveryMethod === 'delivery' && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
                      <MapPin size={12} /> {order.neighborhood}, {order.address},{' '}
                      {order.addressNumber}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#94A3B8' }}>
                      Total
                    </span>
                    <span className="font-extrabold" style={{ color: '#1A2238' }}>
                      R$ {(order.total || order.subtotal).toFixed(2)}
                    </span>
                  </div>
                  {order.couponCode && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                      <CreditCard size={12} /> Cupom: {order.couponCode}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrdersPage;
