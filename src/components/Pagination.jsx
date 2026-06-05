import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const delta = 2
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)

    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700/50">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[2.25rem] h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                p === page
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
