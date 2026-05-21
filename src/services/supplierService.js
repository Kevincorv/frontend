import api from './api'

export const getSuppliers = async (params = {}) => {
  const { data } = await api.get('/suppliers', { params })
  return data
}

export const getSupplier = async (id) => {
  const { data } = await api.get(`/suppliers/${id}`)
  return data
}

export const createSupplier = async (formData) => {
  const { data } = await api.post('/suppliers', formData)
  return data
}

export const updateSupplier = async (id, formData) => {
  const { data } = await api.put(`/suppliers/${id}`, formData)
  return data
}

export const deleteSupplier = async (id) => {
  const { data } = await api.delete(`/suppliers/${id}`)
  return data
}
