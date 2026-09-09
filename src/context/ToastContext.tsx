import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toasts: ToastItem[]
  showToast: (type: ToastType, title: string, message?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, type, title, message }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(id)
      }, 4500)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const bgMap = {
            success: 'bg-emerald-950/90 text-emerald-100 border-emerald-500/50 shadow-emerald-900/20',
            error: 'bg-rose-950/90 text-rose-100 border-rose-500/50 shadow-rose-900/20',
            info: 'bg-indigo-950/90 text-indigo-100 border-indigo-500/50 shadow-indigo-900/20',
            warning: 'bg-amber-950/90 text-amber-100 border-amber-500/50 shadow-amber-900/20',
          }

          const iconMap = {
            success: <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="size-5 text-rose-400 shrink-0" />,
            info: <Info className="size-5 text-indigo-400 shrink-0" />,
            warning: <AlertTriangle className="size-5 text-amber-400 shrink-0" />,
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgMap[toast.type]}`}
            >
              {iconMap[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug">{toast.title}</p>
                {toast.message && (
                  <p className="mt-1 text-xs opacity-85 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
