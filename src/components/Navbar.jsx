import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSidebar } from '../contexts/SidebarContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Productos',
  '/sales': 'Ventas',
  '/caja': 'Caja',
  '/users': 'Usuarios',
  '/branches': 'Sucursales',
  '/reports': 'Reportes',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { toggleSidebar } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const currentTitle = pageTitles[location.pathname] || 'Sistema de Bodega'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {currentTitle}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {(user?.fullName || user?.nombre || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                {user?.fullName || user?.nombre || user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize leading-tight">
                {user?.role || user?.rol || ''}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.fullName || user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {user?.username || user?.email || ''}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
