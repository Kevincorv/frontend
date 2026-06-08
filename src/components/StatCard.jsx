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

  const subtitleColors = {
    primary: 'text-primary-600 dark:text-primary-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }

  const subtitleBg = {
    primary: 'bg-primary-50 dark:bg-primary-900/30',
    green: 'bg-emerald-50 dark:bg-emerald-900/30',
    red: 'bg-red-50 dark:bg-red-900/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30',
    blue: 'bg-blue-50 dark:bg-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30',
  }

  return (
    <div className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0 overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="text-sm sm:text-lg lg:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight break-words">
            {displayValue}
          </p>
          {subtitle && (
            <p className={`inline-block text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg ${subtitleBg[color] || subtitleBg.primary} ${subtitleColors[color] || subtitleColors.primary}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-1.5 sm:p-2 lg:p-3 rounded-xl flex-shrink-0 ${bgLight[color] || bgLight.primary} group-hover:scale-110 transition-transform duration-300`}>
          <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${gradients[color] || gradients.primary} flex items-center justify-center shadow-sm`}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
