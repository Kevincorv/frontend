import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct, updateStock } from '../services/productService'
import { getCategories } from '../services/categoryService'
import { formatCurrency, formatNumber } from '../utils/format'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

const defaultForm = { name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', stock: '', minStock: '', description: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ categoryId: '', estado: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [stockProduct, setStockProduct] = useState(null)
  const [stockForm, setStockForm] = useState({ cantidad: '', motivo: '' })

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.estado) params.estado = filters.estado
      const data = await getProducts(params)
      setProducts(data?.products || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [page, search, filters])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data?.categories || data?.data || data || [])
    } catch {}
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [loadProducts])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFilter = (key, value) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name || '',
      barcode: product.barcode || '',
      categoryId: product.categoryId || product.category?._id || '',
      purchasePrice: product.purchasePrice || '',
      salePrice: product.salePrice || '',
      stock: product.stock || '',
      minStock: product.minStock || '',
      description: product.description || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.purchasePrice || !form.salePrice) {
      toast.error('Los campos nombre, precio compra y precio venta son obligatorios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        salePrice: Number(form.salePrice),
        stock: form.stock ? Number(form.stock) : 0,
        minStock: form.minStock ? Number(form.minStock) : 0,
      }
      if (editing) {
        await updateProduct(editing.id || editing._id, payload)
        toast.success('Producto actualizado')
      } else {
        await createProduct(payload)
        toast.success('Producto creado')
      }
      setModalOpen(false)
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (product) => {
    setDeleteTarget(product)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id || deleteTarget._id)
      toast.success('Producto eliminado')
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const openStockAdjust = (product) => {
    setStockProduct(product)
    setStockForm({ cantidad: '', motivo: '' })
    setStockModalOpen(true)
  }

  const handleStockAdjust = async (e) => {
    e.preventDefault()
    if (!stockForm.cantidad) {
      toast.error('Ingresa una cantidad')
      return
    }
    try {
      await updateStock(stockProduct.id || stockProduct._id, {
        quantity: Number(stockForm.cantidad),
        type: 'ADJUSTMENT',
        note: stockForm.motivo,
      })
      toast.success('Stock actualizado')
      setStockModalOpen(false)
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al ajustar stock')
    }
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (row) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{row.name}</span>
      </div>
    )},
    { key: 'barcode', label: 'Código' },
    { key: 'category', label: 'Categoría', render: (row) => row.category?.name || '-' },
    { key: 'purchasePrice', label: 'Compra', render: (row) => formatCurrency(row.purchasePrice) },
    { key: 'salePrice', label: 'Venta', render: (row) => formatCurrency(row.salePrice) },
    { key: 'stock', label: 'Stock', render: (row) => {
      const isLow = row.stock <= (row.minStock || 0)
      return <span className={`font-medium ${isLow ? 'text-red-600' : ''}`}>{formatNumber(row.stock)}</span>
    }},
    { key: 'minStock', label: 'Stock Mín.', render: (row) => formatNumber(row.minStock) },
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openStockAdjust(row)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Ajustar stock">
          <Package className="h-4 w-4" />
        </button>
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600" title="Editar">
          <Edit2 className="h-4 w-4" />
        </button>
        <button onClick={() => confirmDelete(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Eliminar">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={(e) => handleFilter('categoryId', e.target.value)}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.estado}
            onChange={(e) => handleFilter('estado', e.target.value)}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={products} loading={loading} emptyMessage="No se encontraron productos" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código de Barras</label>
              <input type="text" value={form.barcode} onChange={(e) => setForm({...form, barcode: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
              <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio Compra</label>
              <input type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({...form, purchasePrice: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio Venta</label>
              <input type="number" step="0.01" value={form.salePrice} onChange={(e) => setForm({...form, salePrice: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Mínimo</label>
              <input type="number" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <LoadingSpinner size="sm" />}
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Ajustar Stock - ${stockProduct?.name || ''}`} size="sm">
        <form onSubmit={handleStockAdjust} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cantidad</label>
            <input type="number" value={stockForm.cantidad} onChange={(e) => setStockForm({...stockForm, cantidad: e.target.value})} placeholder="Positiva para entrada, negativa para salida" className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            <p className="text-xs text-slate-400 mt-1">Stock actual: {formatNumber(stockProduct?.stock || 0)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo</label>
            <input type="text" value={stockForm.motivo} onChange={(e) => setStockForm({...stockForm, motivo: e.target.value})} placeholder="Ej: Ajuste de inventario" className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setStockModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Ajustar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
