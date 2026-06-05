import { useState, useEffect } from 'react'
import {
  Package,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CreditCard,
} from 'lucide-react'
import { getSummary, getRecentMovements, getChartData } from '../services/dashboardService'
import { formatCurrency, formatDate, getStatusColor, getStatusText, formatNumber } from '../utils/format'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [recentMovements, setRecentMovements] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [sum, rm, cd] = await Promise.all([
        getSummary().catch(e => { console.error('Summary error:', e); return null }),
        getRecentMovements().catch(e => { console.error('Movements error:', e); return null }),
        getChartData().catch(e => { console.error('ChartData error:', e); return null }),
      ])
      if (sum) setSummary(sum)
      if (rm) setRecentMovements(Array.isArray(rm?.movements || rm?.data || rm) ? (rm.movements || rm.data || rm) : [])
      if (cd) setChartData(cd)
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

  const topSoldLabels = chartData?.topProducts?.map((p) => p.name) || []
  const topSoldValues = chartData?.topProducts?.map((p) => p.total || 0) || []

  const salesLabels = chartData?.last7Days?.map((d) => d.date) || chartData?.sales?.reduce((acc, s) => {
    const day = new Date(s.createdAt).toISOString().slice(0, 10)
    if (!acc.includes(day)) acc.push(day)
    return acc
  }, []) || []
  const salesValues = chartData?.last7Days?.map((d) => d.total || 0) || []

  const barData = {
    labels: topSoldLabels,
    datasets: [
      {
        label: 'Productos más vendidos',
        data: topSoldValues,
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const lineData = {
    labels: salesLabels,
    datasets: [
      {
        label: 'Ventas',
        data: salesValues,
        backgroundColor: 'rgba(16,185,129,0.85)',
        hoverBackgroundColor: '#10b981',
        borderRadius: 6,
        borderSkipped: false,
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
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Ventas de Hoy"
          value={formatNumber(summary?.todaySalesCount || 0)}
          subtitle={formatCurrency(summary?.todaySalesAmount || 0)}
          icon={ShoppingCart}
          color="primary"
        />
        <StatCard
          title="Ingresos últimos 30 días"
          value={formatCurrency(summary?.last30DaysAmount || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Productos"
          value={formatNumber(summary?.totalProducts || 0)}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Ingresos del día"
          value={formatCurrency(summary?.todaySalesAmount || 0)}
          icon={ArrowRightLeft}
          color="blue"
        />
        <StatCard
          title="Productos vendidos hoy"
          value={formatNumber(summary?.todayProductsSold || 0)}
          icon={CreditCard}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30">
              <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
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
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Ventas últimos 7 días
            </h2>
          </div>
          {salesLabels.length > 0 ? (
            <Bar data={lineData} options={chartOptions} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de ventas</p>
          )}
        </div>
      </div>

      <div className="card p-4 sm:p-6 animate-slide-up">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-4">
          Últimos Movimientos
        </h2>
        {recentMovements.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Sin movimientos recientes
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentMovements.slice(0, 5).map((m) => (
              <div key={m.id || m._id} className="flex items-center justify-between py-3 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{m.product?.name || m.product_name || '-'}</p>
                  <p className="text-xs text-slate-500">{formatDate(m.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(m.type)}`}>
                    {getStatusText(m.type)}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
