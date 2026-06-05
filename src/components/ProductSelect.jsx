import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Package, X } from 'lucide-react'
import { getProducts } from '../services/productService'
import { formatCurrency } from '../utils/format'

export default function ProductSelect({ onSelect, placeholder = 'Buscar producto...', autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  const search = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await getProducts({ search: q, limit: 10 })
      setResults(data?.products || data?.data || data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setSelected(null)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (product) => {
    setSelected(product)
    setQuery(product.nombre || product.name || '')
    setOpen(false)
    setResults([])
    onSelect(product)
  }

  const clearSelection = () => {
    setSelected(null)
    setQuery('')
    setResults([])
    onSelect(null)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {selected && (
          <button
            onClick={clearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (query.length >= 2 || selected) && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-500">Buscando...</div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-slate-400">Sin resultados</div>
          )}
          {results.map((product) => (
            <button
              key={product.id || product._id}
              onClick={() => handleSelect(product)}
              className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
            >
              <Package className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {product.nombre || product.name}
                </p>
                <p className="text-xs text-slate-500">
                  {product.code || product.codigo_barras || product.codigo || ''} — Stock: {product.stock ?? 0}
                </p>
              </div>
              <span className="ml-auto text-xs font-medium text-primary-600">
                {formatCurrency(product.salePrice || product.precio_venta || product.price || 0)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
