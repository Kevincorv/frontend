import api from './api'

export const getClients = async (params = {}) => {
  const { data } = await api.get('/clients', { params })
  return data
}

export const getClient = async (id) => {
  const { data } = await api.get(`/clients/${id}`)
  return data
}

export const createClient = async (formData) => {
  const { data } = await api.post('/clients', formData)
  return data
}

export const updateClient = async (id, formData) => {
  const { data } = await api.put(`/clients/${id}`, formData)
  return data
}

export const deleteClient = async (id) => {
  const { data } = await api.delete(`/clients/${id}`)
  return data
}
