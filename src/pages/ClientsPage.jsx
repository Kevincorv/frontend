import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, Users, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClients, createClient, updateClient, deleteClient } from '../services/clientService'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/format'

const defaultForm = { name: '', document: '', email: '', phone: '', address: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState([])
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
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyData, setHistoryData] = useState(null)

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const data = await getClients(params)
      setClients(data?.clients || data?.data || data || [])
      setTotalPages(data?.totalPages || data?.pages || 1)
    } catch {
      toast.error('Error al cargar clientes')
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { loadClients() }, [loadClients])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name || '', document: c.document || '', email: c.email || '', phone: c.phone || '', address: c.address || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('El nombre es obligatorio'); return }
    setSaving(true)
    try {
      if (editing) {
        await updateClient(editing.id || editing._id, form)
        toast.success('Cliente actualizado')
      } else {
        await createClient(form)
        toast.success('Cliente creado')
      }
      setModalOpen(false)
      loadClients()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const confirmDelete = (c) => { setDeleteTarget(c); setConfirmOpen(true) }
  const handleDelete = async () => {
    try {
      await deleteClient(deleteTarget.id || deleteTarget._id)
      toast.success('Cliente eliminado')
      loadClients()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const viewHistory = async (client) => {
    try {
      const { getClient } = await import('../services/clientService')
      const data = await getClient(client.id || client._id)
      setHistoryData(data)
      setHistoryModalOpen(true)
    } catch {
      toast.error('Error al cargar historial')
    }
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (row) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{row.name}</span>
      </div>
    )},
    { key: 'document', label: 'Documento', render: (r) => r.document || '-' },
    { key: 'email', label: 'Email', render: (r) => r.email || '-' },
    { key: 'phone', label: 'Teléfono', render: (r) => r.phone || '-' },
    { key: 'acciones', label: 'Acciones', render: (row) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => viewHistory(row)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Historial de compras"><History className="h-4 w-4" /></button>
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
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar clientes..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"><Plus className="h-4 w-4" /> Nuevo Cliente</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <DataTable columns={columns} data={clients} loading={loading} emptyMessage="No se encontraron clientes" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Documento</label>
              <input type="text" value={form.document} onChange={(e) => setForm({...form, document: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección</label>
              <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
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

      <Modal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title={`Historial de Compras - ${historyData?.name || ''}`} size="lg">
        {historyData?.sales?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500"># Comprobante</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Fecha</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Total</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {historyData.sales.map((sale, i) => (
                  <tr key={sale.id || sale._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">{sale.comprobante || sale.numero || '-'}</td>
                    <td className="px-3 py-2 text-slate-500">{formatDate(sale.createdAt)}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(sale.total || 0)}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sale.estado === 'completado' ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300' : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                        {sale.estado || 'pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">Sin compras registradas</p>
        )}
      </Modal>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar Cliente" message={`¿Estás seguro de eliminar a "${deleteTarget?.name}"?`} confirmText="Eliminar" variant="danger" />
    </div>
  )
}
