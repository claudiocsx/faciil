import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

const CustomerAuthModal = ({ onClose }) => {
  const { customerLogin, customerSignup } = useCustomerAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Preencha email e senha'); return; }
    if (mode === 'signup' && (!form.name || !form.phone)) { setError('Preencha todos os campos'); return; }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-xl" style={{ backgroundColor: '#FDFDFD' }}>
        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>

          <div className="flex flex-col items-center mb-6">
            <h2 className="text-xl font-black" style={{ color: '#1A2238' }}>{mode === 'login' ? 'Entrar' : 'Criar Conta'}</h2>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
              {mode === 'login' ? 'Acompanhe seus pedidos' : 'Cadastro rápido e opcional'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium text-center" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
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
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  placeholder="seu@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#1A2238' }}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', color: '#1A2238' }}
                  placeholder="Mínimo 6 caracteres" />
              </div>
            </div>

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
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
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
