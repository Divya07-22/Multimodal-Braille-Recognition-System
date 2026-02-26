import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Loading from './components/Loading'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import HomePage from './pages/HomePage'
import TextToBraille from './pages/TextToBraille'
import ImageToBraille from './pages/ImageToBraille'
import BrailleToText from './pages/BrailleToText'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'

// Context & Store
import { AccessibilityProvider } from './context/AccessibilityContext'
import { useAuthStore } from './hooks/useAuth'

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── Auth Initializer ──────────────────────────────────────────────────────────
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore()
  useEffect(() => { initialize() }, [])
  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <AuthInitializer>
          <Router>
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-hero)', backgroundAttachment: 'fixed' }}>
              <Navbar />
              <main className="flex-1 relative overflow-hidden">
                {/* Background orbs */}
                <div className="orb orb-1" aria-hidden="true" />
                <div className="orb orb-2" aria-hidden="true" />
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/text-to-braille" element={
                      <ProtectedRoute><TextToBraille /></ProtectedRoute>
                    } />
                    <Route path="/image-to-braille" element={
                      <ProtectedRoute><ImageToBraille /></ProtectedRoute>
                    } />
                    <Route path="/braille-to-text" element={
                      <ProtectedRoute><BrailleToText /></ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(13, 22, 38, 0.95)',
                  color: '#f1f5f9',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
              }}
            />
          </Router>
        </AuthInitializer>
      </AccessibilityProvider>
    </ErrorBoundary>
  )
}

export default App