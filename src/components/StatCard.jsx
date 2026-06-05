import { useEffect, useState } from 'react'

export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value)
      return
    }
    let start = 0
    const end = value
    const duration = 800
    const stepTime = 30
    const steps = duration / stepTime
    const increment = end / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  const gradients = {
    primary: 'from-primary-500 to-blue-600',
    green: 'from-emerald-500 to-green-600',
    red: 'from-red-500 to-rose-600',
    yellow: 'from-yellow-500 to-amber-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-violet-600',
  }

  const bgLight = {
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    green: 'bg-emerald-50 dark:bg-emerald-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
  }

  return (
    <div className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {displayValue}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgLight[color] || bgLight.primary} group-hover:scale-110 transition-transform duration-300`}>
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradients[color] || gradients.primary} flex items-center justify-center shadow-sm`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
