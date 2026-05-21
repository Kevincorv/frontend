import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, X, Eye, Ban, ShoppingCart, Trash2, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPurchases, createPurchase, cancelPurchase, getPurchase } from '../services/purchaseService'
import { getSuppliers } from '../services/supplierService'
import { getProducts } from '../services/productService'
import { formatCurrency, formatDate, getStatusColor, getStatusText, formatNumber } from '../utils/format'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductSelect from '../components/ProductSelect'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', supplierId: '', estado: '', fecha_desde: '', fecha_hasta: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({ supplierId: '', items: [] })
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const loadPurchases = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filters.search) params.search = filters.search
      if (filters.supplierId) params.supplierId = filters.supplierId
      if (filters.estado) params.estado = filters.estado
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta
      const data = await getPurchases(params)
      setPurchases(data?.purchases || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar compras')
    } finally { setLoading(false) }
  }, [page, filters])

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers({ limit: 100 })
      setSuppliers(data?.suppliers || data?.data || data || [])
    } catch {}
  }

  useEffect(() => { loadPurchases(); loadSuppliers() }, [loadPurchases])

  const openCreate = () => {
    setForm({ supplierId: '', items: [] })
    setModalOpen(true)
  }

  const addItem = (product) => {
    if (!product) return
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id || product._id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.purchasePrice || 0,
      }],
    }))
  }

  const removeItem = (index) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  const subtotal = form.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.supplierId) { toast.error('Selecciona un proveedor'); return }
    if (form.items.length === 0) { toast.error('Agrega al menos un producto'); return }
    setSaving(true)
    try {
      await createPurchase({
        supplierId: form.supplierId,
        items: form.items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      })
      toast.success('Compra registrada')
      setModalOpen(false)
      loadPurchases()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar compra')
    } finally { setSaving(false) }
  }

  const viewDetail = async (purchase) => {
    try {
      const data = await getPurchase(purchase.id || purchase._id)
      setDetailData(data)
      setDetailModalOpen(true)
    } catch {
      toast.error('Error al cargar detalle')
    }
  }

  const confirmCancel = (purchase) => {
    setCancelTarget(purchase)
    setCancelOpen(true)
  }

  const handleCancel = async () => {
    try {
      await cancelPurchase(cancelTarget.id || cancelTarget._id)
      toast.success('Compra cancelada')
      loadPurchases()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cancelar')
    }
  }

  const columns = [
    { key: 'comprobante', label: 'Comprobante', render: (r) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{r.comprobante || r.numero || '-'}</span>
      </div>
    )},
    { key: 'supplier', label: 'Proveedor', render: (r) => r.supplier?.name || r.supplier_name || '-' },
    { key: 'createdAt', label: 'Fecha', render: (r) => formatDate(r.createdAt) },
    { key: 'subtotal', label: 'Subtotal', render: (r) => formatCurrency(r.subtotal || 0) },
    { key: 'tax', label: 'Impuesto', render: (r) => formatCurrency(r.tax || 0) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total || 0)}</span> },
    { key: 'status', label: 'Estado', render: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(r.status)}`}>{getStatusText(r.status)}</span> },
    { key: 'user', label: 'Usuario', render: (r) => r.user?.name || r.user_name || '-' },
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => viewDetail(row)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Ver detalle"><Eye className="h-4 w-4" /></button>
        {row.status === 'completado' && (
          <button onClick={() => confirmCancel(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Cancelar compra"><Ban className="h-4 w-4" /></button>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={filters.search} onChange={(e) => { setFilters({...filters, search: e.target.value}); setPage(1) }} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filters.supplierId} onChange={(e) => { setFilters({...filters, supplierId: e.target.value}); setPage(1) }} className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
            <option value="">Todos los proveedores</option>
            {suppliers.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
          </select>
          <select value={filters.estado} onChange={(e) => { setFilters({...filters, estado: e.target.value}); setPage(1) }} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
          <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Nueva Compra</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={purchases} loading={loading} emptyMessage="No se encontraron compras" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Compra" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proveedor</label>
            <select value={form.supplierId} onChange={(e) => setForm({...form, supplierId: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
              <option value="">Seleccionar proveedor</option>
              {suppliers.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Productos</label>
            <ProductSelect onSelect={addItem} placeholder="Buscar producto para agregar..." />
          </div>

          {form.items.length > 0 && (
            <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Producto</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 w-24">Cantidad</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 w-28">Precio Unit.</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 w-28">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {form.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{item.productName}</td>
                      <td className="px-3 py-2">
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="w-20 mx-auto text-center text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="w-28 ml-auto text-right text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1" />
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-medium">
                        {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-semibold">
                    <td colSpan="3" className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">Total:</td>
                    <td className="px-3 py-2 text-right text-slate-900 dark:text-slate-50">{formatCurrency(subtotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <LoadingSpinner size="sm" />}
              Registrar Compra
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalle de Compra - ${detailData?.comprobante || detailData?.numero || ''}`} size="lg">
        {detailData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Proveedor:</span> <span className="text-slate-900 dark:text-slate-100 font-medium">{detailData.supplier?.name || detailData.supplier_name || '-'}</span></div>
              <div><span className="text-slate-500">Fecha:</span> <span className="text-slate-900 dark:text-slate-100">{formatDate(detailData.createdAt)}</span></div>
              <div><span className="text-slate-500">Estado:</span> <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(detailData.status)}`}>{getStatusText(detailData.status)}</span></div>
              <div><span className="text-slate-500">Usuario:</span> <span className="text-slate-900 dark:text-slate-100">{detailData.user?.name || detailData.user_name || '-'}</span></div>
            </div>
            <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Producto</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Cant.</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">P. Unit.</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {(detailData.items || []).map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{item.product?.name || item.product_name || '-'}</td>
                      <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-300">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.unitPrice || 0)}</td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-medium">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-semibold">
                    <td colSpan="2"></td>
                    <td className="px-3 py-2 text-right text-slate-500">Subtotal:</td>
                    <td className="px-3 py-2 text-right text-slate-900 dark:text-slate-50">{formatCurrency(detailData.subtotal || 0)}</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <td colSpan="2"></td>
                    <td className="px-3 py-2 text-right text-slate-500">Impuesto:</td>
                    <td className="px-3 py-2 text-right text-slate-900 dark:text-slate-50">{formatCurrency(detailData.tax || 0)}</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-bold">
                    <td colSpan="2"></td>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">Total:</td>
                    <td className="px-3 py-2 text-right text-slate-900 dark:text-slate-50">{formatCurrency(detailData.total || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <LoadingSpinner size="lg" className="mx-auto" />
        )}
      </Modal>

      <ConfirmDialog isOpen={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel} title="Cancelar Compra" message={`¿Estás seguro de cancelar la compra #${cancelTarget?.comprobante || cancelTarget?.numero || ''}?`} confirmText="Cancelar Compra" variant="warning" />
    </div>
  )
}
