import { useState, useCallback } from 'react'

export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(initialLimit)
  const [totalPages, setTotalPages] = useState(1)

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToPage = useCallback((p) => {
    setPage(Math.max(1, Math.min(p, totalPages)))
  }, [totalPages])

  const setTotal = useCallback((total) => {
    setTotalPages(Math.max(1, Math.ceil(total / limit)))
  }, [limit])

  return { page, limit, totalPages, nextPage, prevPage, goToPage, setTotal, setLimit, setPage }
}
