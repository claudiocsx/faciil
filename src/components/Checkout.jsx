import React, { useState } from 'react';
import { ArrowLeft, Check, CreditCard, Barcode, Wallet, MapPin, Truck, ChevronRight } from 'lucide-react';
import Logo from './Logo';

const Checkout = ({ cart, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', cep: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 299 ? 0 : 19.90;
  const total = subtotal + shipping;

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    onComplete({ ...formData, cart, total, paymentMethod, date: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      <header className="border-b sticky top-0 z-40 backdrop-blur-xl" style={{ backgroundColor: 'rgba(5,5,5,0.8)', borderColor: 'rgba(29,242,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-neon-cyan transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium text-sm">Voltar</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="drop-shadow-[0_0_6px rgba(29,242,255,0.6)]">
                <Logo size={32} />
              </div>
              <span className="font-black text-xl text-text-primary">Checkout</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Steps */}
      <div className="border-b" style={{ borderColor: 'rgba(29,242,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            {[{ num: 1, label: 'Dados' }, { num: 2, label: 'Pagamento' }, { num: 3, label: 'Confirmação' }].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={step >= s.num ? { backgroundColor: '#1DF2FF', color: '#000', boxShadow: '0 0 10px rgba(29,242,255,0.4)' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#666' }}>
                    {step > s.num ? <Check size={16} /> : s.num}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={step >= s.num ? { color: '#1DF2FF' } : { color: '#666' }}>{s.label}</span>
                </div>
                {i < 2 && <div className="w-12 sm:w-20 h-0.5 transition-all" style={{ backgroundColor: step > s.num ? '#1DF2FF' : 'rgba(255,255,255,0.05)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <MapPin size={20} style={{ color: '#1DF2FF' }} /> Dados de Entrega
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: 'name', label: 'Nome Completo', type: 'text', full: true, placeholder: 'Seu nome completo' },
                    { field: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
                    { field: 'phone', label: 'Telefone', type: 'tel', placeholder: '(00) 00000-0000' },
                    { field: 'cep', label: 'CEP', type: 'text', placeholder: '00000-000' },
                    { field: 'address', label: 'Endereço', type: 'text', full: true, placeholder: 'Rua, Avenida...' },
                    { field: 'number', label: 'Número', type: 'text', placeholder: '123' },
                    { field: 'complement', label: 'Complemento', type: 'text', placeholder: 'Apto, Bloco...' },
                    { field: 'neighborhood', label: 'Bairro', type: 'text', placeholder: 'Bairro' },
                    { field: 'city', label: 'Cidade', type: 'text', placeholder: 'Cidade' },
                    { field: 'state', label: 'UF', type: 'text', placeholder: 'SP', max: 2 }
                  ].map(({ field, label, type, full, placeholder, max }) => (
                    <div key={field} className={full ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-text-dim mb-1">{label}</label>
                      <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-dim outline-none transition-all`}
                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(29,242,255,0.4)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        placeholder={placeholder}
                        maxLength={max}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(2)} className="w-full py-4 text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: '#1DF2FF', boxShadow: '0 0 12px rgba(29,242,255,0.5)' }}>
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <CreditCard size={20} style={{ color: '#1DF2FF' }} /> Forma de Pagamento
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'pix', icon: Wallet, label: 'PIX', desc: '5% desconto' },
                    { id: 'credit', icon: CreditCard, label: 'Cartão', desc: 'Até 3x' },
                    { id: 'boleto', icon: Barcode, label: 'Boleto', desc: 'À vista' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className="p-4 rounded-xl border-2 text-center transition-all"
                      style={paymentMethod === m.id ? { borderColor: '#1DF2FF', backgroundColor: 'rgba(29,242,255,0.05)', boxShadow: '0 0 10px rgba(29,242,255,0.2)' } : { borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <m.icon size={24} className="mx-auto mb-2" style={{ color: paymentMethod === m.id ? '#1DF2FF' : '#666' }} />
                      <p className="text-sm font-bold" style={{ color: paymentMethod === m.id ? '#1DF2FF' : '#E0E0E0' }}>{m.label}</p>
                      <p className="text-xs text-text-dim">{m.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 glass-card text-text-secondary rounded-xl font-bold hover:border-neon-cyan/40 transition-all">Voltar</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: '#1DF2FF', boxShadow: '0 0 12px rgba(29,242,255,0.5)' }}>
                    Revisar Pedido <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Check size={20} style={{ color: '#39FF14' }} /> Revisão do Pedido
                </h2>
                <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                    <Truck size={16} style={{ color: '#1DF2FF' }} /> Entrega
                  </div>
                  <p className="text-sm text-text-dim">{formData.name}</p>
                  <p className="text-sm text-text-dim">{formData.address}, {formData.number} {formData.complement}</p>
                  <p className="text-sm text-text-dim">{formData.neighborhood} - {formData.city}/{formData.state}</p>
                </div>
                <div className="p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-secondary mb-1">
                    <CreditCard size={16} style={{ color: '#1DF2FF' }} /> Pagamento
                  </div>
                  <p className="text-sm text-text-dim">
                    {paymentMethod === 'pix' ? 'PIX (5% desconto)' : paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Boleto'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 glass-card text-text-secondary rounded-xl font-bold hover:border-neon-cyan/40 transition-all">Voltar</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 py-4 text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 12px rgba(57,255,20,0.5)' }}>
                    {loading ? (
                      <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processando...</>
                    ) : (
                      <><Check size={18} /> Confirmar Pedido</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-40 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Resumo</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-dim">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#ADFF2F' }}>R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between text-sm text-text-dim">
                  <span>Subtotal</span><span className="text-text-secondary">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: '#ADFF2F' }}>
                  <span>Frete</span><span className="font-semibold">{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                </div>
                {paymentMethod === 'pix' && (
                  <div className="flex justify-between text-sm" style={{ color: '#39FF14' }}>
                    <span>Desconto PIX (5%)</span><span>- R$ {(total * 0.05).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span>Total</span><span style={{ color: '#ADFF2F' }}>R$ {paymentMethod === 'pix' ? (total * 0.95).toFixed(2) : total.toFixed(2)}</span>
                </div>
              </div>
              {shipping === 0 && (
                <p className="text-xs font-semibold text-center p-3 rounded-lg" style={{ color: '#ADFF2F', backgroundColor: 'rgba(173,255,47,0.05)', border: '1px solid rgba(173,255,47,0.15)' }}>
                  Frete grátis!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
