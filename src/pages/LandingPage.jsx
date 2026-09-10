import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Truck,
  DollarSign,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  BoxesIcon,
} from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Gestión de Productos',
    description: 'Controlá tu inventario con códigos, precios y stock actualizado en tiempo real.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: ShoppingCart,
    title: 'Compras',
    description: 'Registrá compras a proveedores y mantené el stock siempre actualizado.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Receipt,
    title: 'Ventas',
    description: 'Efectuá ventas rápidas con diferentes métodos de pago y comprobantes.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: DollarSign,
    title: 'Control de Caja',
    description: 'Seguí ingresos, egresos y movimientos de caja en tiempo real.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: Truck,
    title: 'Proveedores',
    description: 'Administrá tus proveedores con datos de contacto y historial de compras.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Reportes',
    description: 'Generá reportes en PDF y Excel con ventas, compras y movimientos.',
    color: 'from-pink-500 to-pink-600',
  },
]

const steps = [
  { step: '1', title: 'Cargá tus productos', description: 'Agregá tu catálogo completo con precios y código.' },
  { step: '2', title: 'Registrá compras', description: 'Cargá las compras a proveedores para actualizar el stock.' },
  { step: '3', title: 'Efectuá ventas', description: 'Vendé rápido con interfaz intuitiva y comprobantes.' },
  { step: '4', title: 'Revisá reportes', description: 'Analizá el rendimiento de tu negocio con gráficos y reportes.' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BoxesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Gestión de Stock</span>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Sistema completo para tu negocio
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Controlá tu{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                stock
              </span>{' '}
              de forma inteligente
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Administrá productos, compras, ventas y caja desde un solo lugar.
              Simple, rápido y desde cualquier dispositivo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl text-base transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] flex items-center gap-2"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-2xl text-base transition-all duration-200 border border-slate-700/50"
              >
                Conocer más
              </a>
            </div>
          </div>

          {/* Preview card */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-1 shadow-2xl shadow-blue-500/5">
              <div className="bg-slate-800/50 rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-3 text-xs text-slate-500">Dashboard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Productos', value: '15', color: 'text-blue-400' },
                    { label: 'Ventas hoy', value: 'Gs 989K', color: 'text-emerald-400' },
                    { label: 'Proveedores', value: '3', color: 'text-purple-400' },
                    { label: 'Caja', value: 'Gs 1.2M', color: 'text-yellow-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Herramientas diseñadas para simplificar la gestión de tu bodega o negocio.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              En 4 pasos simples tenés tu negocio controlado.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 text-xl font-extrabold shadow-lg shadow-blue-500/25">
                  {step.step}
                </div>
                <h3 className="text-base font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Accedé al sistema y empezá a gestionar tu negocio hoy mismo.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl text-base transition-all duration-200 shadow-xl hover:shadow-2xl hover:bg-blue-50 active:scale-[0.98]"
              >
                Iniciar Sesión
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BoxesIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold">Sistema de Gestión de Stock</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
