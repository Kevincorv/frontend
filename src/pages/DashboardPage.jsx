import { useState, useEffect } from 'react'
import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { getSummary, getLowStock, getRecentMovements, getChartData } from '../services/dashboardService'
import { formatCurrency, formatDate, getStatusColor, getStatusText, formatNumber } from '../utils/format'
import StatCard from '../components/StatCard'
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

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sum, ls, rm, cd] = await Promise.all([
          getSummary(),
          getLowStock(),
          getRecentMovements(),
          getChartData(),
        ])
        setSummary(sum)
        setLowStock(Array.isArray(ls?.products || ls?.data || ls) ? (ls.products || ls.data || ls) : [])
        setRecentMovements(Array.isArray(rm?.movements || rm?.data || rm) ? (rm.movements || rm.data || rm) : [])
        setChartData(cd)
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
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

  const topSoldLabels = chartData?.topProducts?.map((p) => p.name) || []
  const topSoldValues = chartData?.topProducts?.map((p) => p.total || 0) || []

  const salesLabels = chartData?.last7Days?.map((d) => d.date) || []
  const salesValues = chartData?.last7Days?.map((d) => d.total || 0) || []

  const barData = {
    labels: topSoldLabels,
    datasets: [
      {
        label: 'Productos más vendidos',
        data: topSoldValues,
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  }

  const lineData = {
    labels: salesLabels,
    datasets: [
      {
        label: 'Ventas últimos 7 días',
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
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Productos"
          value={formatNumber(summary?.totalProducts || 0)}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Stock Bajo"
          value={formatNumber(summary?.lowStockCount || 0)}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Movimientos Hoy"
          value={formatNumber(summary?.todayMovements || 0)}
          icon={ArrowRightLeft}
          color="blue"
        />
        <StatCard
          title="Valor Inventario"
          value={formatCurrency(summary?.inventoryValue || 0)}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary-600" />
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
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Ventas últimos 7 días
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
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Productos con Stock Bajo
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No hay productos con stock bajo
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Producto</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Stock</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {lowStock.slice(0, 5).map((p) => (
                    <tr key={p.id || p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{p.name}</td>
                      <td className="px-3 py-2">
                        <span className="text-red-600 font-medium">{p.stock}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{p.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Últimos Movimientos
          </h2>
          {recentMovements.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Sin movimientos recientes
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Producto</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Tipo</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Cant.</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentMovements.slice(0, 5).map((m) => (
                    <tr key={m.id || m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{m.product?.name || m.product_name || '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(m.type)}`}>
                          {getStatusText(m.type)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{m.quantity}</td>
                      <td className="px-3 py-2 text-slate-500 text-xs">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
