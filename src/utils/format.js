export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value || 0)
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date))
}

export const getStatusColor = (status) => {
  const colors = {
    activo: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    inactivo: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
    pendiente: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    completado: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    cancelado: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
    anulado: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300',
    baja: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
  }
  return colors[status?.toLowerCase()] || 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
}

export const getStatusText = (status) => {
  const texts = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    pendiente: 'Pendiente',
    completado: 'Completado',
    cancelado: 'Cancelado',
    anulado: 'Anulado',
    baja: 'Baja',
  }
  return texts[status?.toLowerCase()] || status || ''
}

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('es-PE').format(value)
}
