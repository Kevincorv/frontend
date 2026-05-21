import api from './api'

export const getPurchases = async (params = {}) => {
  const { data } = await api.get('/purchases', { params })
  return data
}

export const getPurchase = async (id) => {
  const { data } = await api.get(`/purchases/${id}`)
  return data
}

export const createPurchase = async (formData) => {
  const { data } = await api.post('/purchases', formData)
  return data
}

export const cancelPurchase = async (id) => {
  const { data } = await api.put(`/purchases/${id}/cancel`)
  return data
}
