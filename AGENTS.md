# Meu PDV — Instruções para OpenCode

Idioma: **Português do Brasil** (preferência do usuário). Responda em pt-BR.
Sem TypeScript — projeto **JavaScript puro** (JSX), sem TS configurado.

## Stack verificada

- React 19, Vite 8, Tailwind CSS 4 (via `@tailwindcss/postcss`), Firebase (Auth + Firestore + Storage)
- React Router v7, React Hook Form + Zod, Recharts, date-fns, lucide-react
- PWA via `vite-plugin-pwa` (autoUpdate, workbox com runtime caching para Firebase)
- Lint: ESLint flat config (`eslint.config.js`) + Prettier — pré-commit via husky + lint-staged

## Comandos

| Comando | Para que |
|---|---|
| `npm run dev` | Dev server Vite |
| `npm run build` | Produção em `dist/` |
| `npm run lint` | ESLint no projeto todo |
| `npm run preview` | Preview local do build |
| `npm run format` | Prettier em `src/` |
| `npm run format:check` | Verifica formatação |
| `npm run prepare` | Instala husky (obrigatório após `git clone`) |

**Ordem de verificação sugerida:** `npm run lint` → `npm run build`

## Pré-commit

Husky executa `npx lint-staged` que roda:
- `eslint --fix` + `prettier --write` em `*.{js,jsx}`
- `prettier --write` em `*.{css,json,md}`

## Variáveis de ambiente

6 vars `VITE_FIREBASE_*` necessárias (ver `.env.example`). Firebase lê via `import.meta.env`.
Criar `.env` na raiz baseado em `.env.example`. No Vercel, configurar no dashboard.

## Arquitetura

- **Entrypoint:** `src/main.jsx` → `src/App.jsx` (context providers aninhados)
- **Contextos:** `AuthProvider` (admin) → `CustomerAuthProvider` → `ProductProvider` → `CartProvider` → `ThemeProvider` → `AlertProvider`
- **Rotas:** `/` (loja), `/produto/:id`, `/pedidos`, `/meus-pedidos`, `/carrinho`, `/login`, `/admin/*` (protegido por `ProtectedRoute`)
- **Admin** (rotas filhas de `/admin`): produtos, categorias, fornecedores, cupons, banners, pedidos, clientes, PDV, relatórios, perfil
- **PWA:** service worker registrado manualmente em `main.jsx` + `vite-plugin-pwa` gera `dist/sw.js`. PwaInstallPrompt component na UI.

## Deploy (Vercel)

- Build: `npm run build` → output `dist/`
- `vercel.json` com rewrite SPA (`/((?!api/|.*\\..*).*)` → `/index.html`)
- Importar repo GitHub via vercel.com (não usar Vercel CLI)

## Tailwind CSS 4

Usa `@import 'tailwindcss'` + diretiva `@theme` em `src/index.css` para custom tokens.
**Não** usa `@tailwind base/components/utilities` (sintaxe antiga).
`postcss.config.js` usa `@tailwindcss/postcss` (não `tailwindcss`).
`tailwind.config.js` existe mas pode ser migrado — o `@theme` em CSS é a fonte real.

## Estilo de código

- Prettier: `semi: true, singleQuote: true, tabWidth: 2, trailingComma: 'es5', printWidth: 100`
- Sem pontos-e-vírgula ignorados (semi obrigatório)
- Nomes de componentes em PascalCase, contextos/helpers em camelCase
- CSS com variáveis CSS customizadas + classes utilitárias Tailwind
