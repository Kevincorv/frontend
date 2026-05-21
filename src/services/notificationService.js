import api from './api'

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params })
  return data
}

export const markAsRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`)
  return data
}

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count')
  return data
}
