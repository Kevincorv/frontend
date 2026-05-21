import { useState, useEffect, useCallback } from 'react'
import {
  Bell,
  AlertTriangle,
  Package,
  ShoppingCart,
  Receipt,
  Info,
  CheckCheck,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getNotifications, markAsRead } from '../services/notificationService'
import { formatDateTime } from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const iconMap = {
  alert: AlertTriangle,
  stock: Package,
  purchase: ShoppingCart,
  sale: Receipt,
  info: Info,
  default: Bell,
}

const colorMap = {
  alert: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  stock: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  purchase: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  sale: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  info: 'text-slate-500 bg-slate-100 dark:bg-slate-700',
  default: 'text-primary-500 bg-primary-100 dark:bg-primary-900/30',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data?.notifications || data?.data || data || [])
    } catch {
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      )
    } catch {}
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      const unread = notifications.filter((n) => !n.read)
      for (const n of unread) {
        await markAsRead(n.id || n._id)
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch {
      toast.error('Error al marcar notificaciones')
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Notificaciones
          </h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
              {unreadCount} sin leer
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg disabled:opacity-50"
          >
            {markingAll ? <LoadingSpinner size="sm" /> : <CheckCheck className="h-4 w-4" />}
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          message="No tienes notificaciones pendientes"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const type = notif.type || 'default'
            const IconComponent = iconMap[type] || iconMap.default
            const isRead = notif.read

            return (
              <div
                key={notif.id || notif._id}
                onClick={() => !isRead && handleMarkAsRead(notif.id || notif._id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                  isRead
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                }`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${colorMap[type] || colorMap.default}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium ${isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-50'}`}>
                      {notif.title || 'Notificación'}
                    </h4>
                    {!isRead && (
                      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary-500 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {notif.message || ''}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {formatDateTime(notif.createdAt)}
                  </p>
                </div>
                {isRead && (
                  <Check className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
