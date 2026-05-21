import { useState, useEffect, useCallback } from 'react'
import { Search, Activity, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateTime } from '../utils/format'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', entity: '', fecha_desde: '', fecha_hasta: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filters.search) params.search = filters.search
      if (filters.entity) params.entity = filters.entity
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta
      const { data } = await import('../services/api').then((m) => m.default.get('/activity-logs', { params }))
      setLogs(data?.logs || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar registros de actividad')
    } finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { loadLogs() }, [loadLogs])

  const columns = [
    { key: 'createdAt', label: 'Fecha/Hora', render: (r) => <span className="text-xs">{formatDateTime(r.createdAt)}</span> },
    { key: 'user', label: 'Usuario', render: (r) => r.user?.name || r.user_name || '-' },
    { key: 'action', label: 'Acción', render: (r) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        r.action === 'crear' ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300' :
        r.action === 'actualizar' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300' :
        r.action === 'eliminar' ? 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300' :
        'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
      }`}>{r.action}</span>
    )},
    { key: 'entity', label: 'Entidad', render: (r) => r.entity || '-' },
    { key: 'details', label: 'Detalle', render: (r) => r.details || '-' },
    { key: 'ip', label: 'IP', render: (r) => r.ip || '-' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={filters.search} onChange={(e) => { setFilters({...filters, search: e.target.value}); setPage(1) }} placeholder="Buscar usuario..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filters.entity} onChange={(e) => { setFilters({...filters, entity: e.target.value}); setPage(1) }} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
            <option value="">Todas las entidades</option>
            <option value="producto">Producto</option>
            <option value="categoria">Categoría</option>
            <option value="proveedor">Proveedor</option>
            <option value="cliente">Cliente</option>
            <option value="compra">Compra</option>
            <option value="venta">Venta</option>
            <option value="inventario">Inventario</option>
            <option value="usuario">Usuario</option>
          </select>
          <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
          <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha/Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Entidad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Detalle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8"><LoadingSpinner size="lg" className="mx-auto" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-sm text-slate-400">No se encontraron registros</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id || log._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.user?.name || log.user_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.action === 'crear' ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300' :
                        log.action === 'actualizar' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300' :
                        log.action === 'eliminar' ? 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300' :
                        'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
                      }`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.entity || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{log.details || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{log.ip || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-4">
          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">No se encontraron registros</div>
          ) : (
            logs.map((log, i) => (
              <div key={log.id || log._id || i} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Usuario:</span><span className="text-slate-900 dark:text-slate-100">{log.user?.name || log.user_name || '-'}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Acción:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      log.action === 'crear' ? 'text-green-600 bg-green-100' :
                      log.action === 'actualizar' ? 'text-blue-600 bg-blue-100' :
                      log.action === 'eliminar' ? 'text-red-600 bg-red-100' : 'text-slate-600 bg-slate-100'
                    }`}>{log.action}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">Entidad:</span><span className="text-slate-900 dark:text-slate-100">{log.entity || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Detalle:</span><span className="text-slate-900 dark:text-slate-100 text-right max-w-[60%]">{log.details || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">IP:</span><span className="text-slate-400">{log.ip || '-'}</span></div>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
