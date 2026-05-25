import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(notifs);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const markAsRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const removeNotification = async (id) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const handleClickNotification = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    onClose();
    if (notif.orderId) {
      navigate(`/admin/orders?orderId=${notif.orderId}`);
    } else {
      navigate('/admin/orders');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="absolute right-0 top-full mt-2 w-80 glass-card rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <h3 className="font-bold text-text-primary">Notificações</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X size={16} className="text-text-dim" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-text-dim text-center">Nenhuma notificação</p>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClickNotification(notif)}
              className={`p-3 border-b border-border-subtle hover:bg-white/10 cursor-pointer transition-colors ${!notif.read ? 'bg-white/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary">{notif.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{notif.message}</p>
                  <p className="text-xs text-text-dim mt-1">
                    {new Date(notif.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {!notif.read && (
                    <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-white/10 rounded text-neon-cyan">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => removeNotification(notif.id)} className="p-1 hover:bg-white/10 rounded text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {unreadCount > 0 && (
        <div className="p-3 border-t border-border-subtle">
          <button
            onClick={() => notifications.filter(n => !n.read).forEach(n => markAsRead(n.id))}
            className="w-full py-2 text-xs font-bold text-neon-cyan hover:bg-white/5 rounded-lg transition-colors"
          >
            Marcar todas como lidas
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
