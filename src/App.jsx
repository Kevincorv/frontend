import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SidebarProvider } from './contexts/SidebarContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'
import UsersPage from './pages/UsersPage'
import BranchesPage from './pages/BranchesPage'
import ReportsPage from './pages/ReportsPage'
import CajaPage from './pages/CajaPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/caja" element={<CajaPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/branches"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <BranchesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
