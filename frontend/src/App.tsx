import React, { Suspense } from 'react'
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

// Context
import { AccessibilityProvider } from './context/AccessibilityContext'

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/text-to-braille" element={<TextToBraille />} />
                  <Route path="/image-to-braille" element={<ImageToBraille />} />
                  <Route path="/braille-to-text" element={<BrailleToText />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" reverseOrder={false} />
        </Router>
      </AccessibilityProvider>
    </ErrorBoundary>
  )
}

export default App