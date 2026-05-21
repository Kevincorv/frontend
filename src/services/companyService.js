import api from './api'

export const getCompany = async () => {
  const { data } = await api.get('/company')
  return data
}

export const updateCompany = async (formData) => {
  const { data } = await api.put('/company', formData)
  return data
}
