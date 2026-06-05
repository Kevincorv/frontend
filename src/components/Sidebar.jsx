import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Receipt,
  DollarSign,
  UserCog,
  Building2,
  BarChart3,
  X,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSidebar } from '../contexts/SidebarContext'
import { useState } from 'react'

const mainItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/sales', label: 'Ventas', icon: Receipt },
  { to: '/caja', label: 'Caja', icon: DollarSign },
  { to: '/reports', label: 'Reportes', icon: BarChart3 },
]

const adminItems = [
  { to: '/users', label: 'Usuarios', icon: UserCog },
  { to: '/branches', label: 'Sucursales', icon: Building2 },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const location = useLocation()
  const [adminOpen, setAdminOpen] = useState(true)

  const isAdmin = (user?.role || user?.rol) === 'admin'
  const isActive = (path) => location.pathname === path

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              BodegaSys
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {mainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar()
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-600 dark:text-primary-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span>{item.label}</span>
              {isActive(item.to) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-3 pb-1">
                <button
                  onClick={() => setAdminOpen(!adminOpen)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                >
                  <span>Administración</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {adminOpen && (
                <div className="space-y-0.5 pl-1 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar()
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive(item.to)
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 py-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user?.fullName || user?.nombre || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName || user?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user?.role || user?.rol || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
