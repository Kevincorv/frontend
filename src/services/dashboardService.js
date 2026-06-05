import api from './api'

export const getSummary = async () => {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export const getLowStock = async () => {
  const { data } = await api.get('/dashboard/low-stock')
  return data
}

export const getRecentMovements = async () => {
  const { data } = await api.get('/dashboard/recent-movements')
  return data
}

export const getChartData = async (period = 'month') => {
  const { data } = await api.get('/dashboard/chart-data', { params: { period } })
  return data
}
