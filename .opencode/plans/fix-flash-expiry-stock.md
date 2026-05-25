# Plano: Flash sale expiry + Stock = 0

## Problemas

1. **Flash sale expirada**: preço relâmpago continua após o timer zerar porque `isFlashSale` é calculado só no render inicial — sem re-render quando expira.
2. **Stock = 0**: botões têm `disabled` mas handlers não checam estoque, e WhatsApp "Compre pelo WhatsApp" ignora estoque.

## Arquivos para modificar

### 1. `src/components/ProductCard.jsx`

**a) Estado flashExpired** (após line 9):
```jsx
const [flashExpired, setFlashExpired] = useState(false);
```

**b) isFlashSale usar !flashExpired** (line 17):
```jsx
const isFlashSale = product.flashSale?.endsAt && new Date(product.flashSale.endsAt) > new Date() && !flashExpired;
```

**c) Guard stock=0 no handleAddToCart** (line 39-40):
```jsx
const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;  // <<-- ADICIONAR
    onAddToCart(product);
```

**d) onExpired no CountdownTimer**:
Encontrar `<CountdownTimer endsAt={product.flashSale.endsAt} compact />` e mudar para:
```jsx
<CountdownTimer endsAt={product.flashSale.endsAt} compact onExpired={() => setFlashExpired(true)} />
```

---

### 2. `src/components/ProductDetail.jsx`

**a) Estado flashExpired** (após line 13):
```jsx
const [flashExpired, setFlashExpired] = useState(false);
```

**b) IIFE do preço usar !flashExpired** (line 175):
```jsx
const isFlash = product.flashSale?.endsAt && new Date(product.flashSale.endsAt) > new Date() && !flashExpired;
```

**c) onExpired no CountdownTimer** (line 210):
```jsx
<CountdownTimer endsAt={product.flashSale.endsAt} onExpired={() => setFlashExpired(true)} />
```

**d) Guard stock=0 no handler "Adicionar ao Carrinho"** (line 278):
```jsx
onClick={() => {
    if (availableStock === 0) return;  // <<-- ADICIONAR
    onAddToCart(product, quantity);
```

**e) Guard stock=0 no WhatsApp** (line 300-312):
Envolver o bloco do WhatsApp num check de estoque:
```jsx
{whatsappNumber && availableStock > 0 && (
    <button onClick={() => { ... }}>Compre pelo WhatsApp</button>
)}
```

---

### 3. `src/components/Storefront.jsx`

**a) Estado expiredFlashIds** (no componente):
```jsx
const [expiredFlashIds, setExpiredFlashIds] = useState(new Set());
```

**b) Filtrar flashProducts expirados** (antes de renderizar):
```jsx
const flashProducts = originalFlashProducts.filter(p => !expiredFlashIds.has(p.id));
```

**c) onExpired no CountdownTimer da seção flash** (line 705):
```jsx
<CountdownTimer endsAt={p.flashSale.endsAt} onExpired={() => setExpiredFlashIds(prev => new Set([...prev, p.id]))} />
```

**d) Guard stock=0 nos handlers inline** (linhas ~722-729):
```jsx
onClick={(e) => {
    e.stopPropagation();
    if (p.stock === 0) return;  // <<-- ADICIONAR
    onAddToCart(p);
```

---

### 4. `src/components/FeaturedProducts.jsx`

**a) Guard stock=0** (linha ~89-90):
```jsx
onClick={(e) => {
    e.stopPropagation();
    if (p.stock === 0) return;  // <<-- ADICIONAR
    onAddToCart(p);
}}
```

---

## Ordem de implementação

1. ProductCard.jsx (flash + stock)
2. ProductDetail.jsx (flash + stock)
3. Storefront.jsx (flash + stock)
4. FeaturedProducts.jsx (stock)

## Verificação

```bash
npm run build
```
