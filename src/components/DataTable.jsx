import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'
import { useState } from 'react'

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No se encontraron registros',
  onRowClick,
  sortable = false,
}) {
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (!sortable) return
    if (sortField === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(key)
      setSortDir('asc')
    }
  }

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortField) return 0
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const renderSortIcon = (key) => {
    if (!sortable) return null
    if (sortField !== key) return <ChevronsUpDown className="h-3 w-3 ml-1 inline" />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-1 inline" />
      : <ChevronDown className="h-3 w-3 ml-1 inline" />
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                    col.sortable !== false && sortable ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200' : ''
                  }`}
                >
                  {col.label}
                  {renderSortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedData.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? 'cursor-pointer' : ''
                } hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sortedData.map((row, i) => (
          <div
            key={row.id || row._id || i}
            onClick={() => onRowClick?.(row)}
            className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1.5 text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {col.label}
                </span>
                <span className="text-slate-900 dark:text-slate-100 text-right">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
