import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, UserX, Search, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, createUser, updateUser, deleteUser } from '../services/authService'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

const defaultForm = { username: '', fullName: '', password: '', role: 'employee' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
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

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const data = await getUsers(params)
      setUsers(data?.users || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { loadUsers() }, [loadUsers])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (u) => {
    setEditing(u)
    setForm({
      username: u.username || '',
      fullName: u.fullName || '',
      password: '',
      role: u.role || 'employee',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.username || !form.fullName) { toast.error('Usuario y nombre son obligatorios'); return }
    if (!editing && !form.password) { toast.error('La contraseña es obligatoria'); return }
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (editing) {
        await updateUser(editing.id || editing._id, payload)
        toast.success('Usuario actualizado')
      } else {
        await createUser(payload)
        toast.success('Usuario creado')
      }
      setModalOpen(false)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const confirmDelete = (u) => { setDeleteTarget(u); setConfirmOpen(true) }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget.id || deleteTarget._id)
      toast.success('Usuario eliminado')
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'fullName', label: 'Nombre', render: (r) => (
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{r.fullName}</span>
      </div>
    )},
    { key: 'username', label: 'Usuario' },
    { key: 'role', label: 'Rol', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600"><Edit2 className="h-4 w-4" /></button>
        <button onClick={() => confirmDelete(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Eliminar"><UserX className="h-4 w-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar usuarios..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Nuevo Usuario</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={users} loading={loading} emptyMessage="No se encontraron usuarios" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
              <input type="text" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{editing ? 'Nueva Contraseña (dejar vacío si no cambia)' : 'Contraseña'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
                <option value="employee">Empleado</option>
                <option value="admin">Admin</option>
              </select>
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

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.fullName}"?`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
