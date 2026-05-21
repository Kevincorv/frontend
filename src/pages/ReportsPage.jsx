import { useState, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Search, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getStockReport, getSalesReport, downloadStockPDF, downloadSalesExcel } from '../services/reportService'
import { getCategories } from '../services/categoryService'
import { getSuppliers } from '../services/supplierService'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('stock')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'stock'
              ? 'bg-white dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Reporte de Stock
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'sales'
              ? 'bg-white dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Reporte de Ventas
        </button>
      </div>

      {activeTab === 'stock' ? <StockReport /> : <SalesReport />}
    </div>
  )
}

function StockReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [filters, setFilters] = useState({ categoryId: '', supplierId: '', solo_bajo_stock: false })

  useEffect(() => {
    getCategories({ limit: 100 }).then((d) => setCategories(d?.categories || d?.data || d || [])).catch(() => {})
    getSuppliers({ limit: 100 }).then((d) => setSuppliers(d?.suppliers || d?.data || d || [])).catch(() => {})
  }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.supplierId) params.supplierId = filters.supplierId
      if (filters.solo_bajo_stock) params.solo_bajo_stock = true
      const d = await getStockReport(params)
      setData(d?.products || d?.data || d || [])
    } catch {
      toast.error('Error al generar reporte de stock')
    } finally { setLoading(false) }
  }

  const handleExportPDF = async () => {
    try {
      const blob = await downloadStockPDF(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'reporte_stock.pdf'; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al descargar PDF')
    }
  }

  const columns = [
    { key: 'name', label: 'Producto' },
    { key: 'barcode', label: 'Código' },
    { key: 'category', label: 'Categoría', render: (r) => r.category?.name || '-' },
    { key: 'stock', label: 'Stock', render: (r) => {
      const isLow = r.stock <= (r.minStock || 0)
      return <span className={`font-medium ${isLow ? 'text-red-600' : ''}`}>{formatNumber(r.stock)}</span>
    }},
    { key: 'minStock', label: 'Stock Mín.', render: (r) => formatNumber(r.minStock) },
    { key: 'salePrice', label: 'Precio Venta', render: (r) => formatCurrency(r.salePrice) },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary-600" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Reporte de Stock</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={filters.categoryId} onChange={(e) => setFilters({...filters, categoryId: e.target.value})} className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
        </select>
        <select value={filters.supplierId} onChange={(e) => setFilters({...filters, supplierId: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
          <option value="">Todos los proveedores</option>
          {suppliers.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={filters.solo_bajo_stock} onChange={(e) => setFilters({...filters, solo_bajo_stock: e.target.checked})} className="rounded border-slate-300" />
          Solo bajo stock
        </label>
        <button onClick={loadReport} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Generar</button>
      </div>

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={data} loading={loading} emptyMessage="Genera el reporte para ver resultados" />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleExportPDF} disabled={data.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"><FileText className="h-4 w-4" /> Exportar PDF</button>
      </div>
    </div>
  )
}

function SalesReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ fecha_desde: '', fecha_hasta: '', clientId: '', estado: '' })

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta
      if (filters.clientId) params.clientId = filters.clientId
      if (filters.estado) params.estado = filters.estado
      const d = await getSalesReport(params)
      setData(d?.sales || d?.data || d || [])
    } catch {
      toast.error('Error al generar reporte de ventas')
    } finally { setLoading(false) }
  }

  const handleExportExcel = async () => {
    try {
      const blob = await downloadSalesExcel(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'reporte_ventas.xlsx'; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Excel descargado')
    } catch {
      toast.error('Error al descargar Excel')
    }
  }

  const columns = [
    { key: 'comprobante', label: 'Comprobante', render: (r) => r.comprobante || r.numero || '-' },
    { key: 'client', label: 'Cliente', render: (r) => r.client?.name || r.client_name || 'General' },
    { key: 'createdAt', label: 'Fecha', render: (r) => formatDate(r.createdAt) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total || 0)}</span> },
    { key: 'status', label: 'Estado', render: (r) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        r.status === 'completado' ? 'text-green-600 bg-green-100' : r.status === 'cancelado' ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100'
      }`}>{r.status || 'pendiente'}</span>
    )},
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-green-600" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Reporte de Ventas</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})} className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        <select value={filters.estado} onChange={(e) => setFilters({...filters, estado: e.target.value})} className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button onClick={loadReport} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Generar</button>
      </div>

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={data} loading={loading} emptyMessage="Genera el reporte para ver resultados" />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleExportExcel} disabled={data.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"><FileSpreadsheet className="h-4 w-4" /> Exportar Excel</button>
      </div>
    </div>
  )
}
