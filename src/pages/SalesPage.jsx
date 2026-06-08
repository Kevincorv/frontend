import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Eye, Ban, Receipt, Edit2, Package, Tag, ShoppingCart, DollarSign, CreditCard, Banknote, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSales, createSale, cancelSale, getSale, updateSale } from '../services/saleService'
import { getProducts } from '../services/productService'
import { formatCurrency, formatDate } from '../utils/format'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', fecha_desde: '', fecha_hasta: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ items: [] })
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [allProducts, setAllProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')

  const formatWithDots = (val) => {
    const digits = val.replace(/\D/g, '')
    if (!digits) return ''
    return Number(digits).toLocaleString('es-PY').replace(/,/g, '.')
  }

  const parseAmount = (str) => Number(str.replace(/\./g, '')) || 0

  const loadSales = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filters.search) params.search = filters.search
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta
      const data = await getSales(params)
      setSales(data?.sales || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar ventas')
    } finally { setLoading(false) }
  }, [page, filters.search, filters.fecha_desde, filters.fecha_hasta])

  useEffect(() => { loadSales() }, [loadSales])

  const openCreate = async () => {
    setEditingId(null)
    setForm({ items: [] })
    setPaymentMethod('cash')
    setAmountReceived('')
    setProductSearch('')
    setModalOpen(true)
    try {
      const data = await getProducts({ limit: 500 })
      setAllProducts(data?.products || data?.data || data || [])
    } catch { setAllProducts([]) }
  }

  const openEdit = async (sale) => {
    try {
      const data = await getSale(sale.id || sale._id)
      setEditingId(data.id || data._id)
      setForm({
        items: (data.items || []).map(i => ({
          productId: i.productId || i.product?.id,
          productName: i.product_name || i.product?.name || '',
          quantity: i.quantity || 1,
          unitPrice: Number(i.unitPrice || 0),
        })),
      })
      setPaymentMethod('cash')
      setAmountReceived('')
      setProductSearch('')
      setModalOpen(true)
      const pdata = await getProducts({ limit: 500 })
      setAllProducts(pdata?.products || pdata?.data || pdata || [])
    } catch { toast.error('Error al cargar venta') }
  }

  const addItem = (product) => {
    if (!product) return
    setForm((prev) => {
      const existing = prev.items.find(i => i.productId === (product.id || product._id))
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i => i.productId === (product.id || product._id) ? { ...i, quantity: i.quantity + 1 } : i),
        }
      }
      return {
        ...prev,
        items: [...prev.items, {
          productId: product.id || product._id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.salePrice || 0,
        }],
      }
    })
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
  const amountValue = parseAmount(amountReceived)
  const change = Math.max(0, amountValue - subtotal)

  const filteredProducts = allProducts.filter(p =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.code?.toLowerCase().includes(productSearch.toLowerCase())
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.items.length === 0) { toast.error('Agrega al menos un producto'); return }
    if (paymentMethod === 'cash' && amountValue < subtotal) { toast.error('El monto recibido es menor al total'); return }
    setSaving(true)
    try {
      const payload = {
        items: form.items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        paymentMethod,
      }
      if (editingId) {
        await updateSale(editingId, payload)
        toast.success('Venta actualizada')
      } else {
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

  const getAvatarColor = (name) => {
    const colors = [
      'from-primary-400 to-blue-500', 'from-emerald-400 to-green-500',
      'from-yellow-400 to-amber-500', 'from-red-400 to-rose-500',
      'from-purple-400 to-violet-500', 'from-pink-400 to-fuchsia-500',
      'from-cyan-400 to-teal-500', 'from-orange-400 to-red-500',
    ]
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const columns = [
    { key: 'comprobante', label: 'Comprobante', render: (r) => (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{r.comprobante || r.numero || '-'}</span>
      </div>
    )},
    { key: 'createdAt', label: 'Fecha', render: (r) => formatDate(r.createdAt) },
    { key: 'payment_method', label: 'Método', render: (r) => r.payment_method || 'cash' },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total || 0)}</span> },
    { key: 'user', label: 'Usuario', render: (r) => r.user?.name || r.user_name || '-' },
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => viewDetail(row)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Ver detalle"><Eye className="h-4 w-4" /></button>
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600" title="Editar"><Edit2 className="h-4 w-4" /></button>
        <button onClick={() => confirmCancel(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Cancelar"><Ban className="h-4 w-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full flex-wrap">
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={filters.search} onChange={(e) => { setFilters({...filters, search: e.target.value}); setPage(1) }} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors" />
          </div>
          <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
          <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Nueva Venta</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={sales} loading={loading} emptyMessage="No se encontraron ventas" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? 'Editar Venta' : 'Nueva Venta'} size="full">
        <form onSubmit={handleCreate} className="flex flex-col lg:flex-row h-full">
          <div className="flex-1 overflow-y-auto min-h-0 pb-3 lg:pb-0 lg:pr-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Buscar producto por nombre o código..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
              {filteredProducts.map((product) => (
                <div key={product.id || product._id} className="group bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => addItem(product)}>
                  <div className={`h-16 bg-gradient-to-br ${getAvatarColor(product.name)} flex items-center justify-center relative`}>
                    <Package className="h-7 w-7 text-white/50" />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1 rounded-lg bg-white/90 text-primary-600 shadow-sm"><Plus className="h-4 w-4" /></div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Tag className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{product.code}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs leading-tight mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(product.salePrice)}</span>
                      <span className="text-[10px] text-slate-400">{product.unitType === 'pack' ? `${product.unitsPerPack} unid.` : 'unidad'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <Package className="h-10 w-10 mb-2" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-80 xl:w-96 flex-shrink-0 border-t-2 lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 pt-3 lg:pt-0 lg:pl-6 flex flex-col gap-3 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm"><ShoppingCart className="h-4 w-4" /> Carrito</div>

            {form.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400"><ShoppingCart className="h-8 w-8 mb-2" /><p className="text-xs">Carrito vacío</p></div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-44 lg:max-h-[30vh] pr-1">
                {form.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">{formatCurrency(item.unitPrice)} c/u</p>
                    </div>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Math.max(1, Number(e.target.value)))} className="w-14 text-center text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-1 py-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 text-right">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</span>
                    <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Total</span><span className="font-bold text-slate-900 dark:text-slate-50">{formatCurrency(subtotal)}</span></div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Método de pago</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${paymentMethod === 'cash' ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                    <Banknote className="h-4 w-4" /> Efectivo
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${paymentMethod === 'card' ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                    <CreditCard className="h-4 w-4" /> Tarjeta
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('transfer')} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${paymentMethod === 'transfer' ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                    <DollarSign className="h-4 w-4" /> Transferencia
                  </button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Monto recibido</label>
                  <input type="text" inputMode="numeric" value={amountReceived} onChange={(e) => setAmountReceived(formatWithDots(e.target.value))} placeholder="0" className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 text-right font-bold text-lg" />
                  {amountValue > 0 && amountValue >= subtotal && (
                    <div className="flex justify-between items-center mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Vuelto</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-300">{formatCurrency(change)}</span>
                    </div>
                  )}
                  {amountValue > 0 && amountValue < subtotal && (
                    <p className="text-xs text-red-500 mt-1">Faltan {formatCurrency(subtotal - amountValue)}</p>
                  )}
                </div>
              )}

              <button type="submit" disabled={saving || form.items.length === 0} className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <LoadingSpinner size="sm" />}
                {editingId ? 'Actualizar Venta' : 'Registrar Venta'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalle de Venta - ${detailData?.comprobante || detailData?.numero || ''}`} size="lg">
        {detailData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Fecha:</span> <span className="text-slate-900 dark:text-slate-100">{formatDate(detailData.createdAt)}</span></div>
              <div><span className="text-slate-500">Usuario:</span> <span className="text-slate-900 dark:text-slate-100">{detailData.user?.name || detailData.user_name || '-'}</span></div>
              <div><span className="text-slate-500">Método:</span> <span className="text-slate-900 dark:text-slate-100">{detailData.payment_method || detailData.paymentMethod || 'cash'}</span></div>
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
                  <tr className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500"><td colSpan="4" className="px-3 py-2">Total productos vendidos: {(detailData.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0)}</td></tr>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-semibold"><td colSpan="2"></td><td className="px-3 py-2 text-right text-slate-500">Total:</td><td className="px-3 py-2 text-right">{formatCurrency(detailData.total || 0)}</td></tr>
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
