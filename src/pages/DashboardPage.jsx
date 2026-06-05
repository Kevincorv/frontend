import { useState, useEffect } from 'react'
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react'
import { getSummary, getChartData } from '../services/dashboardService'
import { formatCurrency, formatNumber } from '../utils/format'
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
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [sum, cd] = await Promise.all([
        getSummary().catch(e => { console.error('Summary error:', e); return null }),
        getChartData().catch(e => { console.error('ChartData error:', e); return null }),
      ])
      if (sum) setSummary(sum)
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
        label: 'Ventas últimos 7 días',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Ventas de Hoy"
          value={formatNumber(summary?.todaySalesCount || 0)}
          icon={ShoppingCart}
          color="primary"
        />
        <StatCard
          title="Ingresos de Hoy"
          value={formatCurrency(summary?.todaySalesAmount || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Productos"
          value={formatNumber(summary?.totalProducts || 0)}
          icon={Package}
          color="primary"
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
            <Line data={lineData} options={chartOptions} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de ventas</p>
          )}
        </div>
      </div>
    </div>
  )
}
