import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const AuthModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Preencha todos os campos'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
      onClose();
    } catch (err) {
      setError('Email ou senha inválidos');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-xl" style={{ backgroundColor: '#FDFDFD' }}>
        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>

          <div className="flex flex-col items-center mb-8">
            <Logo size={48} />
            <h2 className="text-xl font-black mt-4" style={{ color: '#1A2238' }}>Acessar Painel</h2>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Área restrita — apenas administradores</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium text-center" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  placeholder="Sua senha"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
