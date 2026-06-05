import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Sin registros', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 mb-4">
        <Icon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1.5">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-sm mb-5">
          {message}
        </p>
      )}
      {action && action}
    </div>
  )
}
