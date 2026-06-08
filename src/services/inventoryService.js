import api from './api'

export const getMovements = async (params = {}) => {
  const { data } = await api.get('/inventory/movements', { params })
  return data
}

export const createAdjustment = async (formData) => {
  const { data } = await api.post('/inventory/adjustment', formData)
  return data
}

export const getLowStock = async () => {
  const { data } = await api.get('/inventory/low-stock')
  return data
}
