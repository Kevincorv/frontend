import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Sin registros', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
        <Icon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-4">
          {message}
        </p>
      )}
      {action && action}
    </div>
  )
}
