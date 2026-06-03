import api from './api'

export const getCajaSummary = async () => {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export const getCajaChart = async () => {
  const { data } = await api.get('/dashboard/chart-data')
  return data
}
