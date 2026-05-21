import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, UserX, Search, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { getBranches } from '../services/branchService'

const defaultForm = { name: '', email: '', password: '', role: '', branchId: '' }

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
  const [toggleTarget, setToggleTarget] = useState(null)
  const [branches, setBranches] = useState([])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { getUsers } = await import('../services/authService')
      const params = { page, limit: 10 }
      if (search) params.search = search
      const data = await getUsers(params)
      setUsers(data?.users || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally { setLoading(false) }
  }, [page, search])

  const loadBranches = async () => {
    try {
      const data = await getBranches({ limit: 100 })
      setBranches(data?.branches || data?.data || data || [])
    } catch {}
  }

  useEffect(() => { loadUsers(); loadBranches() }, [loadUsers])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (u) => {
    setEditing(u)
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || '',
      branchId: u.branchId || u.branch?._id || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Nombre y email son obligatorios'); return }
    if (!editing && !form.password) { toast.error('La contraseña es obligatoria'); return }
    setSaving(true)
    try {
      const { updateUser, createUser } = await import('../services/authService')
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

  const confirmToggle = (u) => { setToggleTarget(u); setConfirmOpen(true) }

  const handleToggleStatus = async () => {
    try {
      const { updateUser } = await import('../services/authService')
      const newStatus = toggleTarget.active ? false : true
      await updateUser(toggleTarget.id || toggleTarget._id, { active: newStatus })
      toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'}`)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (r) => (
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{r.name}</span>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'branch', label: 'Sucursal', render: (r) => r.branch?.name || r.branch_name || '-' },
    { key: 'active', label: 'Estado', render: (r) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.active ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300' : 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'}`}>
        {r.active ? 'activo' : 'inactivo'}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600"><Edit2 className="h-4 w-4" /></button>
        <button onClick={() => confirmToggle(row)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title={row.active ? 'Desactivar' : 'Activar'}><UserX className="h-4 w-4" /></button>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{editing ? 'Nueva Contraseña (dejar vacío si no cambia)' : 'Contraseña'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
                <option value="">Seleccionar rol</option>
                <option value="admin">Admin</option>
                <option value="vendedor">Vendedor</option>
                <option value="almacenero">Almacenero</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sucursal</label>
              <select value={form.branchId} onChange={(e) => setForm({...form, branchId: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
                <option value="">Sin sucursal</option>
                {branches.map((b) => <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>)}
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
        onConfirm={handleToggleStatus}
        title={toggleTarget?.active ? 'Desactivar Usuario' : 'Activar Usuario'}
        message={`¿Estás seguro de ${toggleTarget?.active ? 'desactivar' : 'activar'} a "${toggleTarget?.name}"?`}
        confirmText={toggleTarget?.active ? 'Desactivar' : 'Activar'}
        variant={toggleTarget?.active ? 'danger' : 'info'}
      />
    </div>
  )
}
