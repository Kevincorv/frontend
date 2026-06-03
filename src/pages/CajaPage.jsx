import { useState, useEffect } from 'react'
import {
  ShoppingCart, DollarSign, TrendingUp, Clock, ArrowRightLeft,
  Receipt, Wallet,
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
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export default function CajaPage() {
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [todaySales, setTodaySales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [sum, cd, sales] = await Promise.all([
        getCajaSummary().catch(e => { console.error('Caja summary error:', e); return null }),
        getCajaChart().catch(e => { console.error('Caja chart error:', e); return null }),
        getSalesReport({ startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), status: 'COMPLETED' }).catch(e => { console.error('Caja sales error:', e); return null }),
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
  const comprasHoy = summary?.todayPurchasesAmount || 0
  const balance = Number(ingresosHoy) - Number(comprasHoy)
  const ventasCount = summary?.todaySalesCount || 0

  const salesLabels = chartData?.last7Days?.map((d) => d.date) || []
  const salesValues = chartData?.last7Days?.map((d) => d.total || 0) || []

  const lineData = {
    labels: salesLabels,
    datasets: [
      {
        label: 'Ventas',
        data: salesValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
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

  const topSoldLabels = chartData?.topProducts?.map((p) => p.name) || []
  const topSoldValues = chartData?.topProducts?.map((p) => p.total || 0) || []

  const barData = {
    labels: topSoldLabels,
    datasets: [
      {
        label: 'Cantidad vendida',
        data: topSoldValues,
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Ventas Hoy" value={formatNumber(ventasCount)} icon={ShoppingCart} color="primary" />
        <StatCard title="Ingresos" value={formatCurrency(ingresosHoy)} icon={DollarSign} color="green" />
        <StatCard title="Compras" value={formatCurrency(comprasHoy)} icon={ArrowRightLeft} color="red" />
        <StatCard title="Balance" value={formatCurrency(balance)} icon={Wallet} color={balance >= 0 ? 'green' : 'red'} />
        <StatCard title="Movimientos" value={formatNumber(summary?.todayMovements || 0)} icon={Clock} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Ventas del Día
            </h2>
          </div>
          <DataTable
            columns={columns}
            data={todaySales}
            loading={false}
            emptyMessage="No hay ventas registradas hoy"
          />
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Productos más vendidos
            </h2>
          </div>
          {topSoldLabels.length > 0 ? (
            <Bar data={barData} options={chartOptions} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de ventas</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-purple-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Resumen de Caja
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500">Total Ingresos (ventas)</span>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(ingresosHoy)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500">Total Egresos (compras)</span>
              <span className="text-sm font-semibold text-red-600">{formatCurrency(comprasHoy)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500">Balance del día</span>
              <span className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-500">Ventas realizadas</span>
              <span className="text-sm font-semibold">{formatNumber(ventasCount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
