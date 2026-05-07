import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'vendedor' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo de 6 caracteres';
    if (!isLogin && !formData.name) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name, formData.role);
      }
      navigate('/admin');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro na autenticação: ' + err.message);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-xl" style={{ backgroundColor: '#FDFDFD', border: '1px solid rgba(59,139,185,0.15)',  }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(59,139,185,0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-text-primary">
                {isLogin ? 'Bem-vindo' : 'Criar Conta'}
              </h2>
              <p className="text-sm text-text-dim mt-1">
                {isLogin ? 'Acesse o painel administrativo' : 'Registre-se para começar'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-dim hover:text-text-secondary">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-dim">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-dim outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(59,139,185,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = errors.name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}
                  placeholder="Seu nome"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-dim">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-dim outline-none transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59,139,185,0.4)'}
                onBlur={(e) => e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}
                placeholder="seu@email.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-dim">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-text-primary placeholder-text-dim outline-none transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59,139,185,0.4)'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-dim">Nível de Acesso</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-text-primary outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="vendedor" className="bg-bg-elevated">Vendedor</option>
                <option value="gerente" className="bg-bg-elevated">Gerente</option>
                <option value="admin" className="bg-bg-elevated">Administrador</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ backgroundColor: '#FFB347',  }}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processando...</>
            ) : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="p-6 border-t text-center" style={{ borderColor: 'rgba(59,139,185,0.1)' }}>
          <p className="text-sm text-text-dim">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}
          </p>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-sm mt-1 transition-colors"
            style={{ color: '#FFB347' }}
          >
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
