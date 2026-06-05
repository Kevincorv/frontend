import { useState, useEffect } from 'react'
import {
  Download, FileText, FileSpreadsheet, BarChart3, TrendingUp,
  ShoppingCart, DollarSign, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getStockReport, getSalesReport, downloadStockPDF, downloadSalesExcel } from '../services/reportService'
import { getChartData } from '../services/dashboardService'
import { getCategories } from '../services/categoryService'
import { getSuppliers } from '../services/supplierService'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { grid: { display: false } },
  },
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('ventas')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-1 overflow-x-auto">
        <button onClick={() => setActiveTab('ventas')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            activeTab === 'ventas'
              ? 'bg-white dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}>Reporte de Ventas</button>
        <button onClick={() => setActiveTab('tendencia')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            activeTab === 'tendencia'
              ? 'bg-white dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}>Tendencia y Top</button>
        <button onClick={() => setActiveTab('diario')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            activeTab === 'diario'
              ? 'bg-white dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}>Detalle por Día</button>
        <button onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            activeTab === 'stock'
              ? 'bg-white dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}>Reporte de Stock</button>
      </div>

      {activeTab === 'ventas' && <SalesReport />}
      {activeTab === 'tendencia' && <TrendingReport />}
      {activeTab === 'diario' && <DailyReport />}
      {activeTab === 'stock' && <StockReport />}
    </div>
  )
}

function SalesReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    status: 'COMPLETED',
  })

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.startDate) params.fecha_desde = filters.startDate
      if (filters.endDate) params.fecha_hasta = filters.endDate
      if (filters.status) params.status = filters.status
      const d = await getSalesReport(params)
      setData(d?.sales || d?.data || d || [])
    } catch { toast.error('Error al cargar reporte') }
    finally { setLoading(false) }
  }

  const totalVentas = data.reduce((s, r) => s + Number(r.total || r.totalAmount || 0), 0)
  const totalSubtotal = data.reduce((s, r) => s + Number(r.subtotal || r.totalAmount || 0), 0)

  const handleExportExcel = async () => {
    try {
      const blob = await downloadSalesExcel(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'reporte_ventas.xlsx'; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Excel descargado')
    } catch { toast.error('Error al descargar Excel') }
  }

  const columns = [
    { key: 'comprobante', label: 'Comprobante', render: (r) => r.comprobante || r.numero || `V-${String(r.id).padStart(5, '0')}` },
    { key: 'client', label: 'Cliente', render: (r) => r.client?.name || r.client_name || 'General' },
    { key: 'createdAt', label: 'Fecha', render: (r) => formatDate(r.createdAt) },
    { key: 'subtotal', label: 'Subtotal', render: (r) => formatCurrency(r.subtotal || r.totalAmount || 0) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total || r.totalAmount || 0)}</span> },
    { key: 'user', label: 'Vendedor', render: (r) => r.user?.name || r.user_name || '-' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-green-600" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Reporte de Ventas</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">Total Ventas</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalVentas)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">Total Subtotal</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalSubtotal)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2" />
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
          <option value="COMPLETED">Completado</option>
          <option value="PENDING">Pendiente</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="">Todos</option>
        </select>
        <button onClick={loadReport} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Filtrar</button>
      </div>

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={data} loading={loading}
          emptyMessage="No hay ventas en el período seleccionado" />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleExportExcel} disabled={data.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
          <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
        </button>
      </div>
    </div>
  )
}

function TrendingReport() {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getChartData()
      .then(setChartData)
      .catch(e => console.error('Trending error:', e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>

  const salesLabels = chartData?.last7Days?.map((d) => d.date) || []
  const salesValues = chartData?.last7Days?.map((d) => d.total || 0) || []

  const topSoldLabels = chartData?.topProducts?.map((p) => p.name) || []
  const topSoldValues = chartData?.topProducts?.map((p) => p.total || 0) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Tendencia de Ventas (7 días)</h2>
        </div>
        {salesLabels.length > 0 ? (
          <Line data={{
            labels: salesLabels,
            datasets: [{
              label: 'Ventas',
              data: salesValues,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16,185,129,0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#10b981',
            }],
          }} options={chartOptions} />
        ) : <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Top Productos</h2>
        </div>
        {topSoldLabels.length > 0 ? (
          <Bar data={{
            labels: topSoldLabels,
            datasets: [{
              label: 'Cantidad vendida',
              data: topSoldValues,
              backgroundColor: '#3b82f6',
              borderRadius: 6,
            }],
          }} options={chartOptions} />
        ) : <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>}
      </div>
    </div>
  )
}

function DailyReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      try {
        const d = await getSalesReport({
          fecha_desde: start.toISOString().slice(0, 10),
          fecha_hasta: end.toISOString().slice(0, 10),
          status: 'COMPLETED',
        })
        const sales = d?.sales || d?.data || d || []
        const dailyMap = {}
        sales.forEach(s => {
          const day = new Date(s.createdAt).toISOString().slice(0, 10)
          if (!dailyMap[day]) dailyMap[day] = { date: day, count: 0, total: 0, subtotal: 0 }
          dailyMap[day].count++
          dailyMap[day].total += Number(s.total || s.totalAmount || 0)
          dailyMap[day].subtotal += Number(s.subtotal || s.totalAmount || 0)
        })
        setData(Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date)))
      } catch { toast.error('Error al cargar detalle diario') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const columns = [
    { key: 'date', label: 'Fecha', render: (r) => formatDate(r.date) },
    { key: 'count', label: 'Ventas', render: (r) => formatNumber(r.count) },
    { key: 'subtotal', label: 'Subtotal', render: (r) => formatCurrency(r.subtotal) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total)}</span> },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-purple-500" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Detalle por Día (últimos 30 días)</h2>
      </div>
      <div className="overflow-x-auto">
        <DataTable columns={columns} data={data} loading={loading}
          emptyMessage="No hay datos en los últimos 30 días" />
      </div>
    </div>
  )
}

function StockReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [filters, setFilters] = useState({ categoryId: '', supplierId: '', lowStock: false })

  useEffect(() => {
    getCategories({ limit: 100 }).then(d => setCategories(d?.categories || d?.data || d || [])).catch(() => {})
    getSuppliers({ limit: 100 }).then(d => setSuppliers(d?.suppliers || d?.data || d || [])).catch(() => {})
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.supplierId) params.supplierId = filters.supplierId
      if (filters.lowStock) params.lowStock = 'true'
      const d = await getStockReport(params)
      setData(d?.products || d?.data || d || [])
    } catch { toast.error('Error al cargar reporte de stock') }
    finally { setLoading(false) }
  }

  const handleExportPDF = async () => {
    try {
      const blob = await downloadStockPDF(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'reporte_stock.pdf'; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF descargado')
    } catch { toast.error('Error al descargar PDF') }
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
        <select value={filters.categoryId} onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
        </select>
        <select value={filters.supplierId} onChange={(e) => setFilters({...filters, supplierId: e.target.value})}
          className="text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2">
          <option value="">Todos los proveedores</option>
          {suppliers.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={filters.lowStock} onChange={(e) => setFilters({...filters, lowStock: e.target.checked})} className="rounded border-slate-300" />
          Solo bajo stock
        </label>
        <button onClick={loadReport} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Filtrar</button>
      </div>

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={data} loading={loading}
          emptyMessage="No hay productos disponibles" />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleExportPDF} disabled={data.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
          <FileText className="h-4 w-4" /> Exportar PDF
        </button>
      </div>
    </div>
  )
}
