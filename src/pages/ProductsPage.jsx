import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, Package, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService'
import { formatCurrency } from '../utils/format'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const defaultForm = { code: '', name: '', salePrice: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts({ limit: 500 })
      setProducts(data?.products || data?.data || data || [])
    } catch {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      code: product.code || '',
      name: product.name || '',
      salePrice: product.salePrice || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.code) {
      toast.error('Los campos código y nombre son obligatorios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        code: form.code,
        name: form.name,
        salePrice: Number(form.salePrice) || 0,
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

  const getAvatarColor = (name) => {
    const colors = [
      'from-primary-400 to-blue-500',
      'from-emerald-400 to-green-500',
      'from-yellow-400 to-amber-500',
      'from-red-400 to-rose-500',
      'from-purple-400 to-violet-500',
      'from-pink-400 to-fuchsia-500',
      'from-cyan-400 to-teal-500',
      'from-orange-400 to-red-500',
    ]
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const filtered = products.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar productos por nombre o código..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
          />
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo Producto
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 mb-4">
            <Package className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {search ? 'No se encontraron productos' : 'No hay productos registrados'}
          </p>
          {!search && (
            <button onClick={openCreate} className="btn-primary mt-4">
              <Plus className="h-4 w-4" /> Crear primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id || product._id}
              className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`h-32 bg-gradient-to-br ${getAvatarColor(product.name)} flex items-center justify-center relative`}>
                <Package className="h-12 w-12 text-white/60" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(product) }}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-yellow-600 shadow-sm transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmDelete(product) }}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-600 shadow-sm transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{product.code}</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight mb-3 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(product.salePrice)}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Stock: {product.stock ?? '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
            <input type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio de Venta</label>
            <input type="number" step="0.01" min="0" inputMode="decimal" value={form.salePrice} onChange={(e) => setForm({...form, salePrice: e.target.value})} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <LoadingSpinner size="sm" />}
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar Producto" message={`¿Estás seguro de eliminar "${deleteTarget?.name}"?`} confirmText="Eliminar" variant="danger" />
    </div>
  )
}
