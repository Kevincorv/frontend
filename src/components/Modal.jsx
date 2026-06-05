import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl transform transition-all duration-300 animate-slide-up rounded-t-2xl sm:rounded-t-2xl max-h-[90vh] sm:max-h-none`}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
