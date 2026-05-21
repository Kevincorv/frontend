import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, AlertTriangle, ArrowRightLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMovements, createAdjustment, getLowStock } from '../services/inventoryService'
import { formatDate, formatDateTime, getStatusColor, getStatusText } from '../utils/format'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductSelect from '../components/ProductSelect'

export default function InventoryPage() {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ tipo: '', search: '', fecha_desde: '', fecha_hasta: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [lowStockOpen, setLowStockOpen] = useState(false)
  const [lowStockData, setLowStockData] = useState([])
  const [lowStockLoading, setLowStockLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ cantidad: '', motivo: '' })
  const [saving, setSaving] = useState(false)

  const loadMovements = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filters.tipo) params.tipo = filters.tipo
      if (filters.search) params.search = filters.search
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta
      const data = await getMovements(params)
      setMovements(data?.movements || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar movimientos')
    } finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { loadMovements() }, [loadMovements])

  const openAdjust = () => {
    setSelectedProduct(null)
    setAdjustForm({ cantidad: '', motivo: '' })
    setAdjustModalOpen(true)
  }

  const handleAdjust = async (e) => {
    e.preventDefault()
    if (!selectedProduct) { toast.error('Selecciona un producto'); return }
    if (!adjustForm.cantidad) { toast.error('Ingresa una cantidad'); return }
    setSaving(true)
    try {
      await createAdjustment({
        productId: selectedProduct.id || selectedProduct._id,
        quantity: Number(adjustForm.cantidad),
        type: 'ADJUSTMENT',
        note: adjustForm.motivo,
      })
      toast.success('Ajuste registrado')
      setAdjustModalOpen(false)
      loadMovements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar ajuste')
    } finally { setSaving(false) }
  }

  const openLowStock = async () => {
    setLowStockOpen(true)
    setLowStockLoading(true)
    try {
      const data = await getLowStock()
      setLowStockData(data?.products || data?.data || data || [])
    } catch {
      toast.error('Error al cargar productos con bajo stock')
    } finally { setLowStockLoading(false) }
  }

  const columns = [
    { key: 'createdAt', label: 'Fecha/Hora', render: (r) => <span className="text-xs">{formatDateTime(r.createdAt)}</span> },
    { key: 'product', label: 'Producto', render: (r) => r.product?.name || r.product_name || '-' },
    { key: 'type', label: 'Tipo', render: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(r.type)}`}>{getStatusText(r.type)}</span> },
    { key: 'quantity', label: 'Cantidad', render: (r) => {
      const isPositive = r.type === 'entrada' || r.type === 'INCOME' || r.quantity > 0
      return <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{r.quantity}</span>
    }},
    { key: 'previousStock', label: 'Stock Anterior', render: (r) => r.previousStock ?? '-' },
    { key: 'newStock', label: 'Stock Nuevo', render: (r) => r.newStock ?? '-' },
    { key: 'reference', label: 'Referencia', render: (r) => r.reference || '-' },
    { key: 'user', label: 'Usuario', render: (r) => r.user?.name || r.user_name || '-' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={filters.search} onChange={(e) => { setFilters({...filters, search: e.target.value}); setPage(1) }} placeholder="Buscar producto..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filters.tipo} onChange={(e) => { setFilters({...filters, tipo: e.target.value}); setPage(1) }} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
            <option value="">Todos los tipos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="ajuste">Ajuste</option>
          </select>
          <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
          <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={openLowStock} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg"><AlertTriangle className="h-4 w-4" /> Stock Bajo</button>
          <button onClick={openAdjust} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Ajuste de Stock</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={movements} loading={loading} emptyMessage="No se encontraron movimientos" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={adjustModalOpen} onClose={() => setAdjustModalOpen(false)} title="Ajuste de Stock" size="md">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Producto</label>
            <ProductSelect onSelect={setSelectedProduct} autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cantidad</label>
            <input type="number" value={adjustForm.cantidad} onChange={(e) => setAdjustForm({...adjustForm, cantidad: e.target.value})} placeholder="Usa positivo para entrada, negativo para salida" className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo</label>
            <input type="text" value={adjustForm.motivo} onChange={(e) => setAdjustForm({...adjustForm, motivo: e.target.value})} placeholder="Ej: Ajuste por inventario físico" className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAdjustModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <LoadingSpinner size="sm" />}
              Registrar Ajuste
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={lowStockOpen} onClose={() => setLowStockOpen(false)} title="Productos con Stock Bajo" size="lg">
        {lowStockLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
        ) : lowStockData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No hay productos con stock bajo</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Producto</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Código</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Stock Actual</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Stock Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {lowStockData.map((p) => (
                  <tr key={p.id || p._id}>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-slate-500">{p.barcode || p.codigo || '-'}</td>
                    <td className="px-3 py-2"><span className="text-red-600 font-medium">{p.stock}</span></td>
                    <td className="px-3 py-2 text-slate-500">{p.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}
