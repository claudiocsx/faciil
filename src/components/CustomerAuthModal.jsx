import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

const CustomerAuthModal = ({ onClose }) => {
  const { customerLogin, customerSignup } = useCustomerAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const prev = document.activeElement;
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Preencha email e senha'); return; }
    if (mode === 'signup' && (!form.name || !form.phone)) { setError('Preencha todos os campos'); return; }
    if (mode === 'signup' && form.password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return; }
    if (mode === 'signup' && form.password !== form.confirmPassword) { setError('As senhas não conferem'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await customerLogin(form.email, form.password);
      } else {
        await customerSignup(form.name, form.email, form.password, form.phone);
      }
      onClose();
    } catch (err) {
      setError(mode === 'login' ? 'Email ou senha inválidos' : 'Erro ao criar conta');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Entrar' : 'Criar Conta'}
        className="w-full max-w-sm rounded-xl relative"
        style={{ backgroundColor: '#FDFDFD' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/5 transition-colors z-10" style={{ color: '#94A3B8' }} aria-label="Fechar">
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-xl font-black" style={{ color: '#1A2238' }}>{mode === 'login' ? 'Entrar' : 'Criar Conta'}</h2>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
              {mode === 'login' ? 'Acompanhe seus pedidos' : 'Cadastro rápido e opcional'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium text-center" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }} role="alert">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                      placeholder="Seu nome" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                      placeholder="(88) 99999-9999" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                <input ref={mode === 'login' ? firstInputRef : null} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  placeholder="seu@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                  <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                    placeholder="Repita a senha" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {mode === 'login' ? 'Novo por aqui?' : 'Já tem conta?'}
            </p>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '' }); }}
              className="font-bold text-sm mt-1 transition-colors" style={{ color: '#FFB347' }}>
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
