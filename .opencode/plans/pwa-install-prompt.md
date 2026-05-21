# Plano: Adicionar Prompt de Instalação PWA (Add to Home Screen)

## 1. Adicionar dependência no `package.json`

Já está instalado na `node_modules`. Só precisa adicionar no `package.json`:

```json
// Em "devDependencies", adicione:
"vite-plugin-pwa": "^1.3.0"
```

## 2. Configurar `vite.config.js`

Substitua o conteúdo por:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{svg,png,jpg,jpeg,gif,ico}'],
      manifest: {
        name: 'Faciil - Loja de Tecnologia',
        short_name: 'Faciil',
        description: 'Acessórios de tecnologia com entrega rápida via Uber Flash no Crato-CE.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FDFDFD',
        theme_color: '#FFB347',
        scope: '/',
        icons: [
          {
            src: '/Gemini_Generated_Image_mtu7qwmtu7qwmtu7.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['shopping'],
        lang: 'pt-BR',
        dir: 'ltr',
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5
            }
          }
        ]
      }
    })
  ],
})
```

## 3. Criar `src/components/PwaInstallPrompt.jsx`

```jsx
import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

let deferredPrompt = null

export default function PwaInstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa_dismissed') === 'true'
  )

  useEffect(() => {
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const standalone = window.matchMedia('(display-mode: standalone)').matches

    setIsIOS(iOS)
    setIsStandalone(standalone)

    if (standalone || dismissed) return

    const handler = (e) => {
      e.preventDefault()
      deferredPrompt = e
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS detection - show after some time if not already installed
    if (iOS && !standalone) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      deferredPrompt = null
      setShow(false)
      localStorage.setItem('pwa_dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="mx-auto max-w-md rounded-2xl shadow-2xl border p-4"
        style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(255,179,71,0.3)' }}>
        <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: '#9CA3AF' }}>
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#FFF3E0' }}>
            <Download size={20} style={{ color: '#FFB347' }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: '#1A2238' }}>
              {isIOS ? 'Instalar Faciil' : 'Adicione à tela inicial'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {isIOS
                ? 'Toque em Compartilhar e depois em "Adicionar à Tela de Início"'
                : 'Instale o app para acessar mais rápido e receber ofertas exclusivas.'}
            </p>
          </div>
        </div>

        {!isIOS && (
          <button onClick={handleInstall}
            className="mt-3 w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-105 active:scale-[0.98]"
            style={{ backgroundColor: '#FFB347', color: '#FFFFFF' }}>
            Instalar App
          </button>
        )}

        {isIOS && (
          <p className="mt-2 text-xs text-center" style={{ color: '#9CA3AF' }}>
            Depois de adicionar, acesse como um app normal
          </p>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  )
}
```

## 4. Adicionar no `src/App.jsx`

Adicione a importação e o componente:

```jsx
// No topo, junto com as outras importações:
import PwaInstallPrompt from './components/PwaInstallPrompt'

// Dentro do return, antes ou depois de <AppRoutes />:
<AppRoutes />
<PwaInstallPrompt />
```

---

## Testar

Depois de aplicar:

```bash
npm run dev
```

Abra no celular (ou no Chrome DevTools com device mobile) — o banner vai aparecer no rodapé perguntando se quer instalar.
