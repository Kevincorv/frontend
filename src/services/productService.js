import api from './api'

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params })
  return data
}

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export const createProduct = async (formData) => {
  const { data } = await api.post('/products', formData)
  return data
}

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(`/products/${id}`, formData)
  return data
}

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`)
  return data
}

export const updateStock = async (id, stockData) => {
  const { data } = await api.put(`/products/${id}/stock`, stockData)
  return data
}

export const getLowStock = async () => {
  const { data } = await api.get('/products/low-stock')
  return data
}
