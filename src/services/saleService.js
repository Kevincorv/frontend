import api from './api'

export const getSales = async (params = {}) => {
  const { data } = await api.get('/sales', { params })
  return data
}

export const getSale = async (id) => {
  const { data } = await api.get(`/sales/${id}`)
  return data
}

export const createSale = async (formData) => {
  const { data } = await api.post('/sales', formData)
  return data
}

export const cancelSale = async (id) => {
  const { data } = await api.put(`/sales/${id}/cancel`)
  return data
}

export const updateSale = async (id, formData) => {
  const { data } = await api.put(`/sales/${id}`, formData)
  return data
}
