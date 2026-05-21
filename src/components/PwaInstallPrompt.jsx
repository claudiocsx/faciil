import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

let deferredPrompt = null

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
const IS_IOS = isIOSDevice()

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth < 1024
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
}

export default function PwaInstallPrompt() {
  const [show, setShow] = useState(false)
  const alreadyDismissed = localStorage.getItem('pwa_dismissed') === 'true'
  const [dismissed, setDismissed] = useState(alreadyDismissed)

  useEffect(() => {
    if (!isMobile() || isStandalone() || dismissed) return

    const handler = (e) => {
      e.preventDefault()
      deferredPrompt = e
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (IS_IOS && !isStandalone()) {
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
      setDismissed(true)
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div className="mx-auto max-w-md rounded-2xl shadow-2xl border p-4 relative"
        style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(255,179,71,0.3)' }}>
        <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
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
              {IS_IOS ? 'Instalar Faciil' : 'Adicione à tela inicial'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {IS_IOS
                ? 'Toque em Compartilhar e depois em "Adicionar à Tela de Início"'
                : 'Instale o app para acessar mais rápido e receber ofertas exclusivas.'}
            </p>
          </div>
        </div>

        {!IS_IOS && (
          <button onClick={handleInstall}
            className="mt-3 w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-105 active:scale-[0.98]"
            style={{ backgroundColor: '#FFB347', color: '#FFFFFF' }}>
            Instalar App
          </button>
        )}

        {IS_IOS && (
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
      `}</style>
    </div>
  )
}
