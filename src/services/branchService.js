import api from './api'

export const getBranches = async (params = {}) => {
  const { data } = await api.get('/branches', { params })
  return data
}

export const getBranch = async (id) => {
  const { data } = await api.get(`/branches/${id}`)
  return data
}

export const createBranch = async (formData) => {
  const { data } = await api.post('/branches', formData)
  return data
}

export const updateBranch = async (id, formData) => {
  const { data } = await api.put(`/branches/${id}`, formData)
  return data
}

export const deleteBranch = async (id) => {
  const { data } = await api.delete(`/branches/${id}`)
  return data
}
