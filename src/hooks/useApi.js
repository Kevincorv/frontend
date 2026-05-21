import { useState, useCallback } from 'react'

export function useApi(serviceFunction) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await serviceFunction(...args)
      setData(result)
      return result
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error inesperado'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [serviceFunction])

  return { data, loading, error, execute }
}
