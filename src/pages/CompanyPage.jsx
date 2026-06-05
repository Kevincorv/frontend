import { useState, useEffect, useRef } from 'react'
import { Settings, Upload, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCompany, updateCompany } from '../services/companyService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CompanyPage() {
  const [form, setForm] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    ruc: '',
    taxRate: '',
    currency: 'PYG',
    logo: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCompany()
        if (data) {
          setForm({
            companyName: data.companyName || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            ruc: data.ruc || '',
            taxRate: data.taxRate || '',
            currency: data.currency || 'PYG',
            logo: null,
          })
          if (data.logo) setLogoPreview(data.logo)
        }
      } catch {
        toast.error('Error al cargar configuración')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, logo: file })
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') payload.append(key, value)
      })
      await updateCompany(payload)
      toast.success('Configuración actualizada')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Configuración de la Empresa
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="h-24 w-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-200 dark:border-slate-600">
                  <Building2 className="h-10 w-10 text-slate-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary-600 text-white hover:bg-primary-700"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Logo de la empresa</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de la Empresa</label>
              <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RUC</label>
              <input type="text" name="ruc" value={form.ruc} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tasa de Impuesto (%)</label>
              <input type="number" step="0.01" name="taxRate" value={form.taxRate} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Moneda</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500">
                <option value="PYG">PYG - Guaraní</option>
                <option value="USD">USD - Dólar</option>
                <option value="PEN">PEN - Sol</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
