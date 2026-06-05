import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBranches, createBranch, updateBranch, deleteBranch } from '../services/branchService'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

const defaultForm = { name: '', address: '', phone: '' }

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadBranches = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const data = await getBranches(params)
      setBranches(data?.branches || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar sucursales')
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { loadBranches() }, [loadBranches])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true) }
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name || '', address: b.address || '', phone: b.phone || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('El nombre es obligatorio'); return }
    setSaving(true)
    try {
      if (editing) {
        await updateBranch(editing.id || editing._id, form)
        toast.success('Sucursal actualizada')
      } else {
        await createBranch(form)
        toast.success('Sucursal creada')
      }
      setModalOpen(false)
      loadBranches()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const confirmDelete = (b) => { setDeleteTarget(b); setConfirmOpen(true) }
  const handleDelete = async () => {
    try {
      await deleteBranch(deleteTarget.id || deleteTarget._id)
      toast.success('Sucursal eliminada')
      loadBranches()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (row) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{row.name}</span>
      </div>
    )},
    { key: 'address', label: 'Dirección', render: (r) => r.address || '-' },
    { key: 'phone', label: 'Teléfono', render: (r) => r.phone || '-' },
    { key: 'estado', label: 'Estado', render: (r) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.estado === 'activo' ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300' : 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'}`}>
        {r.estado || 'activo'}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600"><Edit2 className="h-4 w-4" /></button>
        <button onClick={() => confirmDelete(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar sucursales..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Nueva Sucursal</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={branches} loading={loading} emptyMessage="No se encontraron sucursales" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Sucursal' : 'Nueva Sucursal'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
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

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar Sucursal" message={`¿Estás seguro de eliminar "${deleteTarget?.name}"?`} confirmText="Eliminar" variant="danger" />
    </div>
  )
}
