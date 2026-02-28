import React, { type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState(prev => ({ ...prev, errorInfo }))
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            background: 'linear-gradient(135deg, #0a1a2e 0%, #16213e 100%)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '32rem', width: '100%' }}>
            {/* Icon */}
            <div
              style={{
                width: '6rem',
                height: '6rem',
                borderRadius: '1.5rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <AlertTriangle size={40} color="#f87171" />
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
              Something Broke
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
              An unexpected error occurred. Don't worry — your data is safe.
            </p>

            {/* Error details */}
            <div
              className="glass"
              style={{ padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', maxHeight: '10rem', overflowY: 'auto' }}
            >
              <p style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {this.state.error?.message}
              </p>
              {this.state.errorInfo && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary
                    style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Stack trace
                  </summary>
                  <pre
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={this.handleReset} className="btn btn-primary">
                <RefreshCw size={18} /> Try Again
              </button>
              <Link to="/" className="btn btn-secondary">
                <Home size={18} /> Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary