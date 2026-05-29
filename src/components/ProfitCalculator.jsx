import React, { useCallback } from 'react';

const ProfitCalculator = ({ costPrice, profitMargin, price, onChange }) => {
  const handleChange = useCallback(
    (field, value) => {
      const num = value === '' ? '' : parseFloat(value);
      const updates = { costPrice: '', profitMargin: '', price: '' };

      if (field === 'costPrice') {
        updates.costPrice = num;
        updates.profitMargin = profitMargin;
        updates.price = price;
        if (num !== '' && profitMargin !== '' && !isNaN(profitMargin)) {
          updates.price = (num * (1 + profitMargin / 100)).toFixed(2);
        } else if (num !== '' && price !== '' && !isNaN(price) && price > 0) {
          updates.profitMargin = (((price - num) / num) * 100).toFixed(1);
        }
      } else if (field === 'profitMargin') {
        updates.costPrice = costPrice;
        updates.profitMargin = num;
        updates.price = price;
        if (num !== '' && costPrice !== '' && !isNaN(costPrice)) {
          updates.price = (costPrice * (1 + num / 100)).toFixed(2);
        } else if (num !== '' && price !== '' && !isNaN(price)) {
          updates.costPrice = (price / (1 + num / 100)).toFixed(2);
        }
      } else if (field === 'price') {
        updates.costPrice = costPrice;
        updates.profitMargin = profitMargin;
        updates.price = num;
        if (num !== '' && costPrice !== '' && !isNaN(costPrice) && costPrice > 0) {
          updates.profitMargin = (((num - costPrice) / costPrice) * 100).toFixed(1);
        } else if (num !== '' && profitMargin !== '' && !isNaN(profitMargin)) {
          updates.costPrice = (num / (1 + profitMargin / 100)).toFixed(2);
        }
      }

      onChange(updates);
    },
    [costPrice, profitMargin, price, onChange]
  );

  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>
        Calculadora de Lucro
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium" style={{ color: '#64748B' }}>
            Preço de Custo (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={costPrice === '' ? '' : costPrice}
            onChange={(e) => handleChange('costPrice', e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none text-center font-bold"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              color: '#1A2238',
            }}
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#64748B' }}>
            Margem (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1000"
            value={profitMargin === '' ? '' : profitMargin}
            onChange={(e) => handleChange('profitMargin', e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none text-center font-bold"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              color: profitMargin !== '' && parseFloat(profitMargin) >= 0 ? '#059669' : '#1A2238',
            }}
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#64748B' }}>
            Preço de Venda (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price === '' ? '' : price}
            onChange={(e) => handleChange('price', e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none text-center font-bold"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              color: '#1A2238',
            }}
            placeholder="0,00"
          />
        </div>
      </div>
      {costPrice !== '' && price !== '' && !isNaN(costPrice) && !isNaN(price) && costPrice > 0 && (
        <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: '#64748B' }}>
          <span>
            Lucro:{' '}
            <strong
              style={{
                color: profitMargin !== '' && parseFloat(profitMargin) > 0 ? '#059669' : '#EF4444',
              }}
            >
              R$ {(price - costPrice).toFixed(2)}
            </strong>
          </span>
          {profitMargin !== '' && !isNaN(profitMargin) && (
            <span>
              Margem:{' '}
              <strong style={{ color: parseFloat(profitMargin) > 0 ? '#059669' : '#EF4444' }}>
                {profitMargin}%
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitCalculator;
