import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ open: false, title: '', message: '' });
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null, danger: false });

  const showAlert = useCallback((message, title = 'Atenção') => {
    setAlert({ open: true, title, message });
  }, []);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirmação', danger = false) => {
    setConfirm({ open: true, title, message, onConfirm: () => { setConfirm(c => ({ ...c, open: false })); onConfirm?.(); }, danger });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <ConfirmModal
        open={alert.open}
        title={alert.title}
        message={alert.message}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setAlert({ open: false, title: '', message: '' })}
        onCancel={() => setAlert({ open: false, title: '', message: '' })}
      />
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText="Sim"
        cancelText="Cancelar"
        danger={confirm.danger}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ open: false, title: '', message: '', onConfirm: null })}
      />
    </AlertContext.Provider>
  );
};
