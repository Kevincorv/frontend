import api from './api'

export const getStockReport = async (params = {}) => {
  const { data } = await api.get('/reports/stock', { params })
  return data
}

export const getSalesReport = async (params = {}) => {
  const { data } = await api.get('/reports/sales', { params })
  return data
}

export const downloadStockPDF = async (params = {}) => {
  const { data } = await api.get('/reports/stock/pdf', {
    params,
    responseType: 'blob',
  })
  return data
}

export const downloadSalesExcel = async (params = {}) => {
  const { data } = await api.get('/reports/sales/excel', {
    params,
    responseType: 'blob',
  })
  return data
}
