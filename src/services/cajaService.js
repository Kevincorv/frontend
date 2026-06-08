import api from './api'

export const getCajaSummary = async () => {
  const [dashboard, caja] = await Promise.all([
    api.get('/dashboard/summary').then(r => r.data).catch(() => ({})),
    api.get('/caja/summary').then(r => r.data).catch(() => ({})),
  ])
  return { ...dashboard, ...caja }
}

export const getCajaChart = async (period = 'month') => {
  const { data } = await api.get('/dashboard/chart-data', { params: { period } })
  return data
}

export const getCajaMovements = async (params = {}) => {
  const { data } = await api.get('/caja/movements', { params })
  return data
}
