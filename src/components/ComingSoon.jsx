import { Lock } from 'lucide-react'

export default function ComingSoon({ title = 'Sección en desarrollo' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
        <Lock className="h-10 w-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h2>
      <p className="text-sm text-slate-400 dark:text-slate-500">
        Próximamente en funcionamiento
      </p>
    </div>
  )
}
