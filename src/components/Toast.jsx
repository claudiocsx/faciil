import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
        <CheckCircle size={20} className="text-neon-green" />
        <span className="text-sm font-medium text-text-primary">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
