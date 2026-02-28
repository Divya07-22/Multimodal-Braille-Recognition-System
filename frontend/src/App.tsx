import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Accessibility } from "lucide-react";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import AccessibilityPanel from "./components/AccessibilityPanel";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TextToBraille from "./pages/TextToBraille";
import BrailleToText from "./pages/BrailleToText";
import ImageToBraille from "./pages/ImageToBraille";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-wrapper">
        <Sidebar />
        <main className="page-content">
          {children}
        </main>
      </div>
      <Footer />

      {/* Accessibility toggle button */}
      <button
        onClick={() => setAccessibilityOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all hover:scale-110"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Accessibility size={20} />
      </button>

      <AccessibilityPanel
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />
    </div>
  );
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a1a2e 0%, #16213e 100%)'
  }}>
    {children}
  </div>
);

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<MainLayout><Home /></MainLayout>} />
    <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
    <Route path="/text-to-braille" element={<ProtectedRoute><MainLayout><TextToBraille /></MainLayout></ProtectedRoute>} />
    <Route path="/braille-to-text" element={<ProtectedRoute><MainLayout><BrailleToText /></MainLayout></ProtectedRoute>} />
    <Route path="/image-to-braille" element={<ProtectedRoute><MainLayout><ImageToBraille /></MainLayout></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><MainLayout><History /></MainLayout></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App: React.FC = () => (
  <ErrorBoundary>
    <AccessibilityProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AccessibilityProvider>
  </ErrorBoundary>
);

export default App;