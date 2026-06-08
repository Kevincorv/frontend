import api from './api'

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile')
  return data
}

export const updateProfile = async (formData) => {
  const { data } = await api.put('/auth/profile', formData)
  return data
}

export const getUsers = async (params = {}) => {
  const { data } = await api.get('/users', { params })
  return data
}

export const createUser = async (formData) => {
  const { data } = await api.post('/users', formData)
  return data
}

export const updateUser = async (id, formData) => {
  const { data } = await api.put(`/users/${id}`, formData)
  return data
}

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`)
  return data
}
