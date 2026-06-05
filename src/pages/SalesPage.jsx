import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Eye, Ban, Receipt, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSales, createSale, cancelSale, getSale, updateSale } from '../services/saleService'
import { getClients } from '../services/clientService'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../utils/format'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductSelect from '../components/ProductSelect'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', clientId: '', status: '', fecha_desde: '', fecha_hasta: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchRef = useRef()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ clientId: '', items: [] })
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [searchInput, setSearchInput] = useState('')

  const loadSales = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (searchInput) params.search = searchInput
      if (filters.clientId) params.clientId = filters.clientId
      if (filters.status) params.status = filters.status
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta
      const data = await getSales(params)
      setSales(data?.sales || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar ventas')
    } finally { setLoading(false) }
  }, [page, searchInput, filters.clientId, filters.status, filters.fecha_desde, filters.fecha_hasta])

  useEffect(() => { loadSales() }, [loadSales])

  useEffect(() => {
    const timer = setTimeout(() => {
      getClients({ limit: 100 }).then(d => setClients(d?.clients || d?.data || d || [])).catch(() => {})
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => setPage(1), 300)
  }

  const openCreate = () => { setEditingId(null); setForm({ clientId: '', items: [] }); setModalOpen(true) }

  const openEdit = async (sale) => {
    try {
      const data = await getSale(sale.id || sale._id)
      setEditingId(data.id || data._id)
      setForm({
        clientId: data.clientId || data.client?.id || '',
        items: (data.items || []).map(i => ({
          productId: i.productId || i.product?.id,
          productName: i.product_name || i.product?.name || '',
          quantity: i.quantity || 1,
          unitPrice: Number(i.unitPrice || 0),
        })),
      })
      setModalOpen(true)
    } catch { toast.error('Error al cargar venta') }
  }

  const addItem = (product) => {
    if (!product) return
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id || product._id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.salePrice || 0,
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
    if (form.items.length === 0) { toast.error('Agrega al menos un producto'); return }
    setSaving(true)
    try {
      const payload = {
        items: form.items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      }
      if (editingId) {
        await updateSale(editingId, payload)
        toast.success('Venta actualizada')
      } else {
        payload.clientId = form.clientId || undefined
        await createSale(payload)
        toast.success('Venta registrada')
      }
      setModalOpen(false)
      setEditingId(null)
      loadSales()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar venta')
    } finally { setSaving(false) }
  }

  const viewDetail = async (sale) => {
    try {
      const data = await getSale(sale.id || sale._id)
      setDetailData(data)
      setDetailModalOpen(true)
    } catch {
      toast.error('Error al cargar detalle')
    }
  }

  const confirmCancel = (sale) => { setCancelTarget(sale); setCancelOpen(true) }
  const handleCancel = async () => {
    try {
      await cancelSale(cancelTarget.id || cancelTarget._id)
      toast.success('Venta cancelada')
      loadSales()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cancelar')
    }
  }

  const columns = [
    { key: 'comprobante', label: 'Comprobante', render: (r) => (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{r.comprobante || r.numero || '-'}</span>
      </div>
    )},
    { key: 'client', label: 'Cliente', render: (r) => r.client?.name || r.client_name || 'General' },
    { key: 'createdAt', label: 'Fecha', render: (r) => formatDate(r.createdAt) },
    { key: 'subtotal', label: 'Subtotal', render: (r) => formatCurrency(r.subtotal || 0) },
    { key: 'tax', label: 'Impuesto', render: (r) => formatCurrency(r.tax || 0) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total || 0)}</span> },
    { key: 'status', label: 'Estado', render: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(r.status)}`}>{getStatusText(r.status)}</span> },
    { key: 'user', label: 'Usuario', render: (r) => r.user?.name || r.user_name || '-' },
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => viewDetail(row)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Ver detalle"><Eye className="h-4 w-4" /></button>
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600" title="Editar"><Edit2 className="h-4 w-4" /></button>
        {row.status === 'completado' && (
          <button onClick={() => confirmCancel(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Cancelar"><Ban className="h-4 w-4" /></button>
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
            <input type="text" value={searchInput} onChange={handleSearchChange} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filters.clientId} onChange={(e) => { setFilters({...filters, clientId: e.target.value}); setPage(1) }} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
            <option value="">Todos los clientes</option>
            {clients.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => { setFilters({...filters, status: e.target.value}); setPage(1) }} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
            <option value="">Todos los estados</option>
            <option value="COMPLETED">Completado</option>
            <option value="PENDING">Pendiente</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
          <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Nueva Venta</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={sales} loading={loading} emptyMessage="No se encontraron ventas" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? 'Editar Venta' : 'Nueva Venta'} size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente (opcional)</label>
            <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
              <option value="">Venta al público general</option>
              {clients.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
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
                        <input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="w-28 ml-auto text-right text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1" />
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
              {editingId ? 'Actualizar Venta' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalle de Venta - ${detailData?.comprobante || detailData?.numero || ''}`} size="lg">
        {detailData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Cliente:</span> <span className="text-slate-900 dark:text-slate-100 font-medium">{detailData.client?.name || detailData.client_name || 'General'}</span></div>
              <div><span className="text-slate-500">Fecha:</span> <span className="text-slate-900 dark:text-slate-100">{formatDate(detailData.createdAt)}</span></div>
              <div><span className="text-slate-500">Estado:</span> <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(detailData.status)}`}>{getStatusText(detailData.status)}</span></div>
              <div><span className="text-slate-500">Usuario:</span> <span className="text-slate-900 dark:text-slate-100">{detailData.user?.name || detailData.user_name || '-'}</span></div>
            </div>
            <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 dark:bg-slate-800"><th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Producto</th><th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Cant.</th><th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">P. Unit.</th><th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">Subtotal</th></tr></thead>
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
                  <tr className="bg-slate-50 dark:bg-slate-800 font-semibold"><td colSpan="2"></td><td className="px-3 py-2 text-right text-slate-500">Subtotal:</td><td className="px-3 py-2 text-right">{formatCurrency(detailData.subtotal || 0)}</td></tr>
                  <tr className="bg-slate-50 dark:bg-slate-800"><td colSpan="2"></td><td className="px-3 py-2 text-right text-slate-500">Impuesto:</td><td className="px-3 py-2 text-right">{formatCurrency(detailData.tax || 0)}</td></tr>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-bold"><td colSpan="2"></td><td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">Total:</td><td className="px-3 py-2 text-right">{formatCurrency(detailData.total || 0)}</td></tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : <LoadingSpinner size="lg" className="mx-auto" />}
      </Modal>

      <ConfirmDialog isOpen={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel} title="Cancelar Venta" message={`¿Estás seguro de cancelar la venta #${cancelTarget?.comprobante || cancelTarget?.numero || ''}?`} confirmText="Cancelar Venta" variant="warning" />
    </div>
  )
}
