import React from 'react';

const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="fixed inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: '#FFFFFF' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black mb-2" style={{ color: '#1A2238' }}>
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
          {message}
        </p>
        <div className="flex gap-3">
          {cancelText && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border cursor-pointer"
              style={{
                backgroundColor: '#F8FAFC',
                color: '#4A5568',
                borderColor: 'rgba(0,0,0,0.06)',
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`rounded-xl font-bold text-sm transition-all cursor-pointer ${cancelText ? 'flex-1' : 'w-full'}`}
            style={{
              backgroundColor: danger ? '#EF4444' : '#FFB347',
              color: danger ? '#FFFFFF' : '#1A2238',
              padding: '12px 0',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
