import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  Warehouse,
  UserCog,
  Building2,
  BarChart3,
  Bell,
  Settings,
  Activity,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSidebar } from '../contexts/SidebarContext'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/suppliers', label: 'Proveedores', icon: Truck },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/purchases', label: 'Compras', icon: ShoppingCart },
  { to: '/sales', label: 'Ventas', icon: Receipt },
  { to: '/inventory', label: 'Inventario', icon: Warehouse },
  { to: '/users', label: 'Usuarios', icon: UserCog, adminOnly: true },
  { to: '/branches', label: 'Sucursales', icon: Building2, adminOnly: true },
  { to: '/reports', label: 'Reportes', icon: BarChart3 },
  { to: '/notifications', label: 'Notificaciones', icon: Bell },
  { to: '/company', label: 'Configuración', icon: Settings },
  { to: '/activity-logs', label: 'Actividad', icon: Activity },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { sidebarOpen, toggleSidebar } = useSidebar()

  const filteredItems = navigationItems.filter((item) => {
    if (item.adminOnly && user?.rol !== 'admin') return false
    return true
  })

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Bodega
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar()
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
