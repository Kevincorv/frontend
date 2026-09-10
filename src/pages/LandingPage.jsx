import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Truck,
  DollarSign,
  Zap,
  ArrowRight,
  BoxesIcon,
  Shield,
  Clock,
  Smartphone,
  TrendingUp,
  Users,
  Star,
  ChevronDown,
  Check,
  Globe,
  Lock,
  BarChart,
  Headphones,
} from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Gestión de Productos',
    description: 'Controlá tu inventario con códigos, precios y stock actualizado en tiempo real.',
    color: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/20',
  },
  {
    icon: ShoppingCart,
    title: 'Compras',
    description: 'Registrá compras a proveedores y mantené el stock siempre actualizado.',
    color: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/20',
  },
  {
    icon: Receipt,
    title: 'Ventas',
    description: 'Efectuá ventas rápidas con diferentes métodos de pago y comprobantes.',
    color: 'from-orange-500 to-orange-600',
    shadow: 'shadow-orange-500/20',
  },
  {
    icon: DollarSign,
    title: 'Control de Caja',
    description: 'Seguí ingresos, egresos y movimientos de caja en tiempo real.',
    color: 'from-yellow-500 to-yellow-600',
    shadow: 'shadow-yellow-500/20',
  },
  {
    icon: Truck,
    title: 'Proveedores',
    description: 'Administrá tus proveedores con datos de contacto y historial de compras.',
    color: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/20',
  },
  {
    icon: BarChart3,
    title: 'Reportes',
    description: 'Generá reportes en PDF y Excel con ventas, compras y movimientos.',
    color: 'from-pink-500 to-pink-600',
    shadow: 'shadow-pink-500/20',
  },
]

const highlights = [
  {
    icon: Shield,
    title: 'Seguro y confiable',
    description: 'Tus datos protegidos con encriptación y respaldos automáticos en la nube.',
  },
  {
    icon: Smartphone,
    title: 'Desde cualquier dispositivo',
    description: 'Accedé desde tu celular, tablet o computadora. Todo responsive.',
  },
  {
    icon: Clock,
    title: 'Tiempo real',
    description: 'Actualizaciones instantáneas. El stock y los reports se refrescan al momento.',
  },
  {
    icon: Zap,
    title: 'Ultra rápido',
    description: 'Interfaz ágil pensada para que registres ventas en segundos.',
  },
]

const steps = [
  { step: '1', title: 'Cargá tus productos', description: 'Agregá tu catálogo completo con precios y código.' },
  { step: '2', title: 'Registrá compras', description: 'Cargá las compras a proveedores para actualizar el stock.' },
  { step: '3', title: 'Efectuá ventas', description: 'Vendé rápido con interfaz intuitiva y comprobantes.' },
  { step: '4', title: 'Revisá reportes', description: 'Analizá el rendimiento de tu negocio con gráficos y reportes.' },
]

const testimonials = [
  {
    name: 'María González',
    role: 'Dueña de Almacén Don José',
    text: 'Desde que uso el sistema, puedo controlar todo el stock desde el celular. Las ventas se registran súper rápido.',
    rating: 5,
  },
  {
    name: 'Carlos Ramírez',
    role: 'Gerente de Distribuidora Norte',
    text: 'Los reportes me ayudan a tomar mejores decisiones. Antes perdía horas con planillas de Excel.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Responsable de Kiosco Sol',
    text: 'Lo mejor es el control de caja. Siempre sé cuánto ingreso y cuánto gasto cada día.',
    rating: 5,
  },
]

const stats = [
  { value: 500, suffix: '+', label: 'Negocios activos' },
  { value: 15000, suffix: '+', label: 'Productos gestionados' },
  { value: 99.9, suffix: '%', label: 'Uptime del sistema' },
  { value: 24, suffix: '/7', label: 'Disponibilidad' },
]

const faqs = [
  {
    q: '¿Necesito instalar algo?',
    a: 'No. El sistema funciona desde el navegador. Solo necesitás conexión a internet.',
  },
  {
    q: '¿Puedo usarlo desde el celular?',
    a: 'Sí, está optimizado para funcionar en celulares, tablets y computadoras.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Usamos TiDB Cloud con encriptación SSL y respaldos automáticos.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'El sistema es de uso libre. Solo necesitás una cuenta para acceder.',
  },
]

function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const isFloat = !Number.isInteger(target)
    const totalTicks = 60
    const increment = target / totalTicks
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current))
      }
    }, duration / totalTicks)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return (
    <span ref={ref}>
      {typeof count === 'number' && count % 1 !== 0 ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  )
}

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-800/50 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-900/50 transition-colors"
      >
        <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
      </div>
    </div>
  )
}

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
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BoxesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Gestión de Stock</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Funciones
            </a>
            <a href="#faq" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Preguntas
            </a>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8 animate-pulse">
              <Zap className="h-4 w-4" />
              Sistema completo para tu negocio
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
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
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl text-base transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] flex items-center gap-2"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-2xl text-base transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
              >
                Conocer más
              </a>
            </div>
          </div>

          {/* Browser mockup */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-1 shadow-2xl shadow-blue-500/5 transform hover:scale-[1.01] transition-transform duration-500">
              <div className="bg-slate-800/50 rounded-xl p-4 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-3 text-xs text-slate-500 font-mono">sistemadestock.vercel.app/dashboard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    { label: 'Productos', value: '15', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Ventas hoy', value: 'Gs 989K', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Proveedores', value: '3', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Caja', value: 'Gs 1.2M', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} rounded-xl p-4 border border-slate-700/20`}>
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <p className={`text-lg sm:text-xl font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-medium">Ventas últimos 7 días</span>
                    <span className="text-xs text-emerald-400 font-medium">+12.5%</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                      <span key={d} className="text-[10px] text-slate-600 flex-1 text-center">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-800/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-blue-400 mb-3 tracking-wider uppercase">Funciones</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
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
                className="group bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 sm:p-7 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-blue-400 mb-3 tracking-wider uppercase">Ventajas</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              ¿Por qué elegirnos?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <item.icon className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-blue-400 mb-3 tracking-wider uppercase">Proceso</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              En 4 pasos simples tenés tu negocio controlado.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500/50 via-blue-500 to-blue-500/50"></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.step} className="text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-5 text-xl font-extrabold shadow-lg shadow-blue-500/25 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/3 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-blue-400 mb-3 tracking-wider uppercase">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 sm:p-7 hover:border-slate-700/50 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-blue-400 mb-3 tracking-wider uppercase">FAQ</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-8 sm:p-14 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-blue-100 mb-6">
                <Lock className="h-4 w-4" />
                Acceso seguro con encriptación SSL
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5">
                ¿Listo para empezar?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Accedé al sistema y empezá a gestionar tu negocio hoy mismo. Sin configuración complicada.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="group px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-blue-50 active:scale-[0.98] flex items-center gap-2"
                >
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <Check className="h-4 w-4" />
                  Sin costo
                </div>
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <Check className="h-4 w-4" />
                  Configuración instantánea
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BoxesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Sistema de Gestión de Stock</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Funciones</a>
              <a href="#faq" className="hover:text-white transition-colors">Preguntas</a>
              <Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
            </div>
          </div>
          <div className="border-t border-slate-800/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Sistema de Gestión de Stock. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Globe className="h-3.5 w-3.5" />
                Hecho en Paraguay
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Headphones className="h-3.5 w-3.5" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
