import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Se já estiver logado, manda para o admin
  if (user) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#050505' }}>
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="text-center max-w-md relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 drop-shadow-[0_0_12px rgba(0,212,255,0.6)]" style={{ backgroundColor: 'rgba(0,212,255,0.05)' }}>
          <Logo size={80} />
        </div>
        <h1 className="text-3xl font-black text-text-primary mb-4">Faciil</h1>
        <p className="text-text-dim mb-8">Faça login para acessar o painel administrativo</p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-full py-3 px-4 text-black font-bold rounded-xl transition-all"
          style={{ backgroundColor: '#00D4FF', boxShadow: '0 0 12px rgba(0,212,255,0.5)' }}
        >
          Entrar no Painel Admin
        </button>
        <Link
          to="/"
          className="mt-4 block w-full py-3 px-4 font-semibold rounded-xl glass-card text-text-primary hover:border-neon-cyan/40 transition-all"
        >
          Ir para a Loja
        </Link>
      </div>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default LoginPage;
