import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Package, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Todos los campos son obligatorios')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Inicio de sesión exitoso')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 dark:border-slate-700/50">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 shadow-lg shadow-primary-500/25 mb-5">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              BodegaSys
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Usuario o Correo
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario o correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.98]"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold hover:underline transition-colors">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
