import { useState, useEffect } from 'react'
import {
  ShoppingCart, DollarSign, TrendingUp, Clock,
  Receipt, Wallet, Star,
} from 'lucide-react'
import { getCajaSummary, getCajaChart } from '../services/cajaService'
import { getSalesReport } from '../services/reportService'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import StatCard from '../components/StatCard'
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
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function CajaPage() {
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [todaySales, setTodaySales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().slice(0, 10)
      const [sum, cd, sales] = await Promise.all([
        getCajaSummary().catch(e => { console.error('Caja summary error:', e); return null }),
        getCajaChart().catch(e => { console.error('Caja chart error:', e); return null }),
        getSalesReport({ startDate: today, endDate: today, status: 'COMPLETED' }).catch(e => { console.error('Caja sales error:', e); return null }),
      ])
      if (sum) setSummary(sum)
      if (cd) setChartData(cd)
      if (sales) setTodaySales(Array.isArray(sales?.sales || sales?.data || sales) ? (sales.sales || sales.data || sales) : [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const ingresosHoy = summary?.todaySalesAmount || 0
  const ventasCount = summary?.todaySalesCount || 0
  const balance = Number(ingresosHoy)
  const todayMovements = summary?.todayMovements || 0

  const topProducts = chartData?.topProducts || []
  const starProduct = topProducts[0]
  const topSoldLabels = topProducts.map((p) => p.name) || []
  const topSoldValues = topProducts.map((p) => p.total || 0) || []

  const salesLabels = chartData?.last7Days?.map((d) => d.date) || []
  const salesValues = chartData?.last7Days?.map((d) => d.total || 0) || []

  const lineData = {
    labels: salesLabels,
    datasets: [
      {
        label: 'Ventas',
        data: salesValues,
        borderColor: '#10b981',
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return 'rgba(16,185,129,0.1)'
          const gradient = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom)
          gradient.addColorStop(0, 'rgba(16,185,129,0.3)')
          gradient.addColorStop(1, 'rgba(16,185,129,0.02)')
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  }

  const columns = [
    { key: 'comprobante', label: 'Comprobante', render: (r) => r.comprobante || r.numero || `V-${String(r.id).padStart(5, '0')}` },
    { key: 'client', label: 'Cliente', render: (r) => r.client?.name || r.client_name || 'General' },
    { key: 'createdAt', label: 'Hora', render: (r) => formatDate(r.createdAt) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-semibold">{formatCurrency(r.total || 0)}</span> },
  ]

  const barData = {
    labels: topSoldLabels,
    datasets: [
      {
        label: 'Cantidad vendida',
        data: topSoldValues,
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ventas Hoy" value={formatNumber(ventasCount)} icon={ShoppingCart} color="primary" />
        <StatCard title="Ingresos" value={formatCurrency(ingresosHoy)} icon={DollarSign} color="green" />
        <StatCard title="Balance" value={formatCurrency(balance)} icon={Wallet} color={balance >= 0 ? 'green' : 'red'} />
        <StatCard title="Movimientos" value={formatNumber(todayMovements)} icon={Clock} color="blue" />
      </div>

      {starProduct && (
        <div className="card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Producto Estrella</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{starProduct.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{starProduct.total} unidades vendidas</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30">
              <Receipt className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Ventas del Día
            </h2>
          </div>
          <DataTable
            columns={columns}
            data={todaySales}
            loading={false}
            emptyMessage="No hay ventas registradas hoy"
          />
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total del día
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(ingresosHoy)}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Tendencia de Ventas (7 días)
            </h2>
          </div>
          {salesLabels.length > 0 ? (
            <Line data={lineData} options={chartOptions} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de ventas</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Productos más vendidos
            </h2>
          </div>
          {topSoldLabels.length > 0 ? (
            <Bar data={barData} options={chartOptions} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de ventas</p>
          )}
        </div>

        <div className="card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
              <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Resumen de Caja
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-700/50">
              <span className="text-sm text-slate-500">Total Ingresos (ventas)</span>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(ingresosHoy)}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-700/50">
              <span className="text-sm text-slate-500">Balance del día</span>
              <span className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-700/50">
              <span className="text-sm text-slate-500">Ventas realizadas</span>
              <span className="text-sm font-semibold">{formatNumber(ventasCount)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-sm text-slate-500">Movimientos del día</span>
              <span className="text-sm font-semibold">{formatNumber(todayMovements)}</span>
            </div>
            {starProduct && (
              <div className="flex justify-between py-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-slate-500">Producto estrella</span>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{starProduct.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
