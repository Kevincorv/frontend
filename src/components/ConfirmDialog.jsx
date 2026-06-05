import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react'

const variants = {
  danger: {
    icon: AlertCircle,
    bg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    button: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    button: 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    button: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800',
  },
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}) {
  if (!isOpen) return null

  const { icon: Icon, bg, iconColor, button } = variants[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl p-6 rounded-t-2xl sm:rounded-t-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className={`p-3.5 rounded-2xl ${bg} mb-4`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {message}
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm active:scale-[0.98] ${button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
